const Service = require('../models/Service');

const DEFAULT_COUNTRIES = [
  'USA',
  'UK',
  'UAE',
  'Singapore',
  'India',
  'Australia',
  'Netherlands',
  'Saudi Arabia',
];

const COUNTRY_CORE_PLANS = [
  {
    country: 'USA',
    plans: [
      {
        name: 'Micro',
        slug: 'micro-plan-usa',
        description: 'For first-time founders who need the basics to launch with confidence.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 499,
        features: [
          'Company Formation (LLC/C-Corp)',
          'Registered Agent Service',
          'Portal Access & Document Storage',
        ],
      },
      {
        name: 'Vitals',
        slug: 'vitals-plan-usa',
        description: 'Stay 100% compliant with tax, legal, and regulatory rules.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 199,
        features: [
          'All Micro Features',
          'IRS Business Tax Filings (e.g., Form 1120/1065)',
          'State Annual Report Filing',
          'Automated Bookkeeping & Analytics',
        ],
      },
      {
        name: 'Elite',
        slug: 'elite-plan-usa',
        description: 'For founders who want full legal + compliance, plus a dedicated bookkeeper.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 299,
        features: [
          'All Vitals Features',
          'Dedicated Human Bookkeeper',
          'Priority Legal Support',
          'Quarterly Financial Reviews',
        ],
      },
    ],
  },
  {
    country: 'India',
    plans: [
      {
        name: 'Startup',
        slug: 'startup-plan-india',
        description: 'Perfect for new ventures getting registered.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 24999,
        features: [
          'Pvt. Ltd. Incorporation (MCA)',
          'DSC & DIN for 2 Directors',
          'PAN & TAN Allotment',
          'GST Registration',
          'Commencement Certificate (20A)',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-india',
        description: 'Ongoing accounting and statutory returns.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 49999,
        features: [
          'Everything in Startup',
          'Monthly Bookkeeping',
          'Monthly GST Returns',
          'Quarterly TDS Returns',
          'Annual MCA Compliance (AOC-4/MGT-7)',
        ],
      },
      {
        name: 'Growth',
        slug: 'growth-plan-india',
        description: 'Complete financial back-office & strategy.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 99999,
        features: [
          'Everything in Compliance',
          'Audit Liaison & Coordination',
          'Annual Income Tax Return',
          'Virtual CFO (Strategic Reviews)',
          'FEMA/RBI Compliance (FDI)',
        ],
      },
    ],
  },
  {
    country: 'UK',
    plans: [
      {
        name: 'Formation',
        slug: 'formation-plan-uk',
        description: 'Core setup for your UK Limited company.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 499,
        features: [
          'Companies House Registration',
          'Registered Office Address (London)',
          'Director Service Address',
          'Bank Account Support',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-uk',
        description: 'Formation plus ongoing annual compliance.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 999,
        features: [
          'All Formation Features',
          'Confirmation Statement Filing',
          'Statutory Register Maintenance',
          'HMRC Corporation Tax Registration',
        ],
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one-plan-uk',
        description: 'Complete package with bookkeeping and tax.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 2499,
        features: [
          'All Compliance Features',
          'Monthly Bookkeeping (MTD)',
          'Quarterly VAT Returns',
          'Annual Accounts & CT600 Filing',
        ],
      },
    ],
  },
  {
    country: 'Singapore',
    plans: [
      {
        name: 'Formation',
        slug: 'formation-plan-singapore',
        description: 'Core setup for your Singapore Pte. Ltd. company.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 999,
        features: [
          'ACRA Name Reservation',
          'Company Incorporation',
          'Nominee Director Service',
          'Bank Account Assistance',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-singapore',
        description: 'Formation plus ongoing annual compliance.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 1999,
        features: [
          'All Formation Features',
          'Registered Office Address',
          'Corporate Secretary Service',
          'Annual Return Filing (ACRA)',
        ],
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one-plan-singapore',
        description: 'Complete package with bookkeeping and tax.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 3499,
        features: [
          'All Compliance Features',
          'Unaudited Financial Statements',
          'GST Registration & Filing',
          'Annual Tax Filing (IRAS)',
        ],
      },
    ],
  },
  {
    country: 'UAE',
    plans: [
      {
        name: 'Formation',
        slug: 'formation-plan-uae',
        description: 'Core setup for your UAE company.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 1999,
        features: [
          'License & Registration',
          'Establishment Card',
          'Bank Account Assistance',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-uae',
        description: 'Formation plus ongoing annual compliance.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 2999,
        features: [
          'All Formation Features',
          'Trade License Renewal',
          'VAT & Corporate Tax Registration',
          'Annual Compliance Management',
        ],
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one-plan-uae',
        description: 'Complete package with bookkeeping and tax.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 4999,
        features: [
          'All Compliance Features',
          'Monthly Bookkeeping',
          'Quarterly VAT Filing',
          'Annual Corporate Tax Filing',
        ],
      },
    ],
  },
  {
    country: 'Australia',
    plans: [
      {
        name: 'Formation',
        slug: 'formation-plan-australia',
        description: 'Core setup for your Australian Pty Ltd company.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 999,
        features: [
          'ASIC Company Registration',
          'ABN, TFN, and GST Registration',
          'Nominee Director Service',
          'Registered Office Address',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-australia',
        description: 'Formation plus ongoing annual compliance.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 2499,
        features: [
          'All Formation Features',
          'Annual ASIC Company Statement',
          'ASIC Registered Agent Service',
          'Annual Solvency Resolution',
        ],
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one-plan-australia',
        description: 'Complete package with bookkeeping and tax.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 4999,
        features: [
          'All Compliance Features',
          'Monthly Bookkeeping',
          'BAS Lodgement',
          'Annual Company Tax Return (ATO)',
        ],
      },
    ],
  },
  {
    country: 'Netherlands',
    plans: [
      {
        name: 'Formation',
        slug: 'formation-plan-netherlands',
        description: 'Core setup for your Dutch B.V.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 999,
        features: [
          'Notarial Deed of Incorporation',
          'KVK Registration',
          'UBO Register Filing',
          'Bank Account Assistance',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-netherlands',
        description: 'Formation plus ongoing annual compliance.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 1999,
        features: [
          'All Formation Features',
          'Registered Office Address',
          'Annual KVK Filings',
          'Corporate Tax Registration',
        ],
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one-plan-netherlands',
        description: 'Complete package with bookkeeping and tax.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 3999,
        features: [
          'All Compliance Features',
          'Monthly Bookkeeping',
          'Quarterly BTW (VAT) Returns',
          'Annual Corporate Income Tax Return (VPB)',
        ],
      },
    ],
  },
  {
    country: 'Saudi Arabia',
    plans: [
      {
        name: 'Formation',
        slug: 'formation-plan-saudi-arabia',
        description: 'Core setup for your KSA business.',
        category: 'formation',
        uiCategory: 'Formation',
        price: 4999,
        features: [
          'MISA License Application',
          'Commercial Registration (CR)',
          'Articles of Association (AoA)',
          'Bank Account Assistance',
        ],
      },
      {
        name: 'Compliance',
        slug: 'compliance-plan-saudi-arabia',
        description: 'Formation plus ongoing annual compliance.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 7999,
        features: [
          'All Formation Features',
          'MISA & CR Renewals',
          'GOSI & ZATCA Registration',
          'Nitaqat Advisory',
        ],
      },
      {
        name: 'All-in-One',
        slug: 'all-in-one-plan-saudi-arabia',
        description: 'Complete package with bookkeeping and tax.',
        category: 'annual-compliance',
        uiCategory: 'Compliance',
        price: 12999,
        features: [
          'All Compliance Features',
          'Monthly Bookkeeping',
          'Quarterly VAT Filing',
          'Annual Zakat/Tax Filing',
        ],
      },
    ],
  },
];

const DEFAULT_CORE_SERVICES = COUNTRY_CORE_PLANS.flatMap(({ country, plans }) =>
  plans.map((plan) => ({
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    category: plan.category,
    uiType: 'core',
    uiCategory: plan.uiCategory,
    pricing: { starter: plan.price, growth: plan.price, scale: plan.price },
    features: plan.features,
    isActive: true,
    countries: [country],
  }))
);

const DEFAULT_ADDON_SERVICES = [
  {
    name: 'Trademark Registration',
    slug: 'trademark-registration',
    description: 'Protect your brand name and logo with a US Federal Trademark.',
    category: 'audit-support',
    uiType: 'addon',
    uiCategory: 'IP Protection',
    pricing: { starter: 499, growth: 499, scale: 499 },
    countries: DEFAULT_COUNTRIES,
    isActive: true,
  },
  {
    name: 'S-Corp Election (Form 2553)',
    slug: 's-corp-election',
    description: 'Reduce self-employment taxes by electing S-Corp status with the IRS.',
    category: 'tax-compliance',
    uiType: 'addon',
    uiCategory: 'Tax Strategy',
    pricing: { starter: 149, growth: 149, scale: 149 },
    countries: DEFAULT_COUNTRIES,
    isActive: true,
  },
  {
    name: 'Certificate of Good Standing',
    slug: 'certificate-of-good-standing',
    description: 'Official state document proving your business is compliant.',
    category: 'annual-compliance',
    uiType: 'addon',
    uiCategory: 'Compliance',
    pricing: { starter: 99, growth: 99, scale: 99 },
    countries: DEFAULT_COUNTRIES,
    isActive: true,
  },
  {
    name: 'Foreign Qualification',
    slug: 'foreign-qualification',
    description: 'Register your existing LLC to do business in another state.',
    category: 'formation',
    uiType: 'addon',
    uiCategory: 'Expansion',
    pricing: { starter: 249, growth: 249, scale: 249 },
    countries: DEFAULT_COUNTRIES,
    isActive: true,
  },
  {
    name: 'Articles of Amendment',
    slug: 'articles-of-amendment',
    description: 'Change your company name, address, or member structure.',
    category: 'formation',
    uiType: 'addon',
    uiCategory: 'Legal',
    pricing: { starter: 199, growth: 199, scale: 199 },
    countries: DEFAULT_COUNTRIES,
    isActive: true,
  },
  {
    name: 'ITIN Application',
    slug: 'itin-application',
    description: 'Individual Taxpayer Identification Number for non-US residents.',
    category: 'tax-compliance',
    uiType: 'addon',
    uiCategory: 'Tax ID',
    pricing: { starter: 300, growth: 300, scale: 300 },
    countries: DEFAULT_COUNTRIES,
    isActive: true,
  },
];

let defaultsEnsured = false;

const ensureDefaultServices = async () => {
  if (defaultsEnsured) return;
  const ops = [...DEFAULT_CORE_SERVICES, ...DEFAULT_ADDON_SERVICES].map((service) => ({
    updateOne: {
      filter: { slug: service.slug },
      update: { $setOnInsert: service },
      upsert: true,
    },
  }));
  if (ops.length) {
    await Service.bulkWrite(ops, { ordered: false });
  }
  defaultsEnsured = true;
};

exports.getAllServices = async (req, res) => {
  try {
    await ensureDefaultServices();
    const { category, country, isActive } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (country) query.countries = country;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const services = await Service.find(query).sort('name');

    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
