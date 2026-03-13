const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const getS3Config = () => {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 is not configured. Set AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.');
  }

  return {
    bucket,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  };
};

const createClient = () => {
  const config = getS3Config();
  return new S3Client({
    region: config.region,
    credentials: config.credentials,
  });
};

const uploadToS3 = async ({ buffer, key, contentType }) => {
  const { bucket, region } = getS3Config();
  const client = createClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return { bucket, region, key };
};

const getS3Object = async ({ bucket, key }) => {
  const client = createClient();
  return client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
};

module.exports = {
  getS3Config,
  uploadToS3,
  getS3Object,
};
