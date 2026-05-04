const OAuthClient = require('intuit-oauth');
const crypto = require('crypto');
const User = require('../models/User');

const oauthClient = new OAuthClient({
  clientId: process.env.QB_CLIENT_ID,
  clientSecret: process.env.QB_CLIENT_SECRET,
  environment: process.env.QB_ENVIRONMENT || 'sandbox',
  redirectUri: process.env.QB_REDIRECT_URI,
});

const TOKEN_ENCRYPTION_SECRET =
  process.env.QB_TOKEN_ENCRYPTION_KEY || process.env.QB_TOKENS_ENCRYPTION_KEY || '';
const ENCRYPTION_PREFIX = 'enc';

const getTokenEncryptionKey = () => {
  if (!TOKEN_ENCRYPTION_SECRET) return null;
  return crypto.createHash('sha256').update(String(TOKEN_ENCRYPTION_SECRET)).digest();
};

const encryptTokenValue = (value) => {
  if (!value) return value;
  if (typeof value !== 'string') value = String(value);
  if (value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;

  const key = getTokenEncryptionKey();
  if (!key) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
};

const decryptTokenValue = (value) => {
  if (!value || typeof value !== 'string') return value;
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;

  const key = getTokenEncryptionKey();
  if (!key) {
    throw new Error('QuickBooks token is encrypted but QB_TOKEN_ENCRYPTION_KEY is missing.');
  }

  const parts = value.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted QuickBooks token format.');
  }

  const [, ivB64, authTagB64, encryptedB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

const getQuickBooksTokens = (user) => {
  const stored = user?.quickBooksTokens || {};
  return {
    accessToken: decryptTokenValue(stored.accessToken),
    refreshToken: decryptTokenValue(stored.refreshToken),
    realmId: stored.realmId,
    expiresAt: stored.expiresAt,
  };
};

const buildStoredQuickBooksTokens = ({ accessToken, refreshToken, realmId, expiresAt }) => ({
  accessToken: encryptTokenValue(accessToken),
  refreshToken: encryptTokenValue(refreshToken),
  realmId,
  expiresAt,
});

const makeApiCall = async (accessToken, realmId, url, method = 'GET', body = null) => {
  const baseUrl = process.env.QB_ENVIRONMENT === 'sandbox' 
    ? 'https://sandbox-quickbooks.api.intuit.com'
    : 'https://quickbooks.api.intuit.com';
  
  const isPdfRequest = url.includes('/pdf');
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': isPdfRequest ? 'application/pdf' : 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}/v3/company/${realmId}/${url}`, options);
  
  if (isPdfRequest) {
    const buffer = await response.arrayBuffer();
    return { status: response.status, data: buffer, contentType: 'application/pdf' };
  }
  
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

const refreshTokenIfNeeded = async (user, force = false) => {
  const tokens = getQuickBooksTokens(user);
  if (!tokens?.realmId) return user;

  const expiresAt = tokens.expiresAt ? new Date(tokens.expiresAt) : null;
  const now = new Date();

  const shouldRefresh =
    force ||
    !expiresAt ||
    Number.isNaN(expiresAt.getTime()) ||
    !tokens.accessToken ||
    expiresAt <= now;

  if (!shouldRefresh) {
    return user;
  }

  if (!tokens.refreshToken) {
    user.quickBooksConnected = false;
    user.quickBooksTokens = {};
    await user.save();
    const authError = new Error('QuickBooks refresh token missing. Please reconnect.');
    authError.status = 401;
    authError.code = 'QB_REFRESH_INVALID';
    throw authError;
  }

  try {
    oauthClient.setToken({
      refresh_token: tokens.refreshToken,
    });

    const authResponse = await oauthClient.refresh();
    const token = authResponse.getJson();

    user.quickBooksTokens = buildStoredQuickBooksTokens({
      accessToken: token.access_token,
      refreshToken: token.refresh_token || tokens.refreshToken,
      realmId: tokens.realmId,
      expiresAt: new Date(Date.now() + token.expires_in * 1000)
    });
    await user.save();
    return user;
  } catch (error) {
    console.error('Token refresh error:', error);
    const errorText = [
      error?.oauth_error,
      error?.error,
      error?.body?.error,
      error?.body?.error_description,
      error?.message
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const isInvalidRefresh =
      errorText.includes('refresh') && (errorText.includes('invalid') || errorText.includes('expired') || errorText.includes('grant'));

    if (isInvalidRefresh) {
      user.quickBooksConnected = false;
      user.quickBooksTokens = {};
      await user.save();
      const authError = new Error('QuickBooks authorization expired. Please reconnect.');
      authError.status = 401;
      authError.code = 'QB_REFRESH_INVALID';
      throw authError;
    }

    throw error;
  }
};

const callQuickBooks = async (user, { method = 'GET', url, data }) => {
  let refreshedUser;
  try {
    refreshedUser = await refreshTokenIfNeeded(user);
  } catch (error) {
    if (error?.code === 'QB_REFRESH_INVALID' || error?.status === 401) {
      return { result: { status: 401, data: { message: error.message } }, user };
    }
    throw error;
  }
  const initialTokens = getQuickBooksTokens(refreshedUser);
  let result = await makeApiCall(
    initialTokens.accessToken,
    initialTokens.realmId,
    url,
    method,
    data
  );

  if (result.status === 401) {
    try {
      refreshedUser = await refreshTokenIfNeeded(refreshedUser, true);
      const refreshedTokens = getQuickBooksTokens(refreshedUser);
      result = await makeApiCall(
        refreshedTokens.accessToken,
        refreshedTokens.realmId,
        url,
        method,
        data
      );
    } catch (error) {
      if (error?.code === 'QB_REFRESH_INVALID' || error?.status === 401) {
        return { result: { status: 401, data: { message: error.message } }, user: refreshedUser };
      }
      throw error;
    }
  }

  return { result, user: refreshedUser };
};

exports.getAuthUrl = (req, res) => {
  try {
    const authUri = oauthClient.authorizeUri({
      // offline_access is required to receive a refresh token and keep the integration persistent.
      scope: [OAuthClient.scopes.Accounting, 'offline_access'],
      state: req.user.id,
    });
    res.json({ success: true, authUrl: authUri });
  } catch (error) {
    console.error('QuickBooks Auth URL Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    const { code, realmId, state } = req.query;
    const userId = state;

    console.log('QuickBooks Callback:', { code: !!code, realmId, userId });

    const authResponse = await oauthClient.createToken(req.url);
    const token = authResponse.getJson();

    console.log('QuickBooks Token Success');

    await User.findByIdAndUpdate(userId, {
      quickBooksConnected: true,
      quickBooksTokens: buildStoredQuickBooksTokens({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        realmId,
        expiresAt: new Date(Date.now() + token.expires_in * 1000)
      }),
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?qb_status=success&page=settings`);
  } catch (error) {
    console.error('QuickBooks Callback Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?qb_status=error&page=settings`);
  }
};

exports.disconnect = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      quickBooksConnected: false,
      quickBooksTokens: {}
    });
    res.json({ success: true, message: 'QuickBooks disconnected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkConnection = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ 
      success: true, 
      connected: user.quickBooksConnected || false 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyInfo = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user.quickBooksConnected) {
      return res.status(400).json({ message: 'QuickBooks not connected' });
    }

    const { result } = await callQuickBooks(user, {
      method: 'GET',
      url: 'companyinfo/' + user.quickBooksTokens.realmId
    });
    
    if (result.status === 401) {
      return res.status(401).json({ message: 'QuickBooks authorization expired. Please reconnect.' });
    }

    res.json({ success: true, companyInfo: result.data });
  } catch (error) {
    console.error('Get company info error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user.quickBooksConnected) {
      return res.status(400).json({ message: 'QuickBooks not connected' });
    }

    const { result } = await callQuickBooks(user, {
      method: 'GET',
      url: 'query?query=select * from Invoice'
    });
    
    if (result.status === 401) {
      return res.status(401).json({ message: 'QuickBooks authorization expired. Please reconnect.' });
    }

    res.json({ success: true, invoices: result.data?.QueryResponse?.Invoice || [] });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.proxyRequest = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user.quickBooksConnected) {
      return res.status(400).json({ message: 'QuickBooks not connected' });
    }

    const { method, url, data } = req.body;

    const { result } = await callQuickBooks(user, { method, url, data });
    if (result.status === 401) {
      return res.status(401).json({ message: 'QuickBooks authorization expired. Please reconnect.' });
    }
    
    if (result.contentType === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.status(result.status || 200).send(Buffer.from(result.data));
    } else {
      res.status(result.status || 200).json(result.data);
    }
  } catch (error) {
    console.error('Proxy request error:', error);
    res.status(500).json({ message: error.message });
  }
};
