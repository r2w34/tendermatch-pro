const { initializeDatabase } = require('../config/database');
const Tender = require('../models/Tender');
const User = require('../models/User');
const { TENDER_CATEGORIES, DEPARTMENTS, INDIAN_STATES } = require('../config/constants');

// Sample tender data
const sampleTenders = [
  {
    tender_ref_no: 'GEM/2024/B/12345',
    title: 'Supply of Computer Hardware and Peripherals for Government Office',
    description: 'Procurement of desktop computers, laptops, printers, and other IT equipment for various government departments. The tender includes installation, configuration, and 3-year warranty.',
    department: 'Ministry of Information Technology',
    state: 'Maharashtra',
    city: 'Mumbai',
    budget_min: 500000,
    budget_max: 2000000,
    publish_date: new Date('2024-01-15'),
    bid_deadline: new Date('2024-02-15'),
    category: 'IT Equipment',
    source_portal: 'GeM',
    source_url: 'https://gem.gov.in/tender/12345',
    documents: [
      { name: 'Tender Document.pdf', url: 'https://example.com/doc1.pdf', type: 'pdf' },
      { name: 'Technical Specifications.pdf', url: 'https://example.com/doc2.pdf', type: 'pdf' }
    ],
    eligibility_criteria: {
      turnover: '₹50 Lakh minimum annual turnover',
      experience: '3 years experience in IT equipment supply',
      certification: 'ISO 9001:2015 certified'
    },
    contact_details: {
      officer: 'Shri Rajesh Kumar',
      designation: 'Assistant Director (Procurement)',
      phone: '+91-22-12345678',
      email: 'procurement@gov.in'
    }
  },
  {
    tender_ref_no: 'CPPP/2024/B/67890',
    title: 'Construction of Primary School Building in Rural Area',
    description: 'Construction of a new primary school building with 8 classrooms, library, computer lab, and playground facilities. The project includes civil work, electrical installations, and furniture.',
    department: 'Ministry of Education',
    state: 'Karnataka',
    city: 'Bangalore',
    budget_min: 5000000,
    budget_max: 8000000,
    publish_date: new Date('2024-01-20'),
    bid_deadline: new Date('2024-03-20'),
    category: 'Construction',
    source_portal: 'CPPP',
    source_url: 'https://eprocure.gov.in/tender/67890',
    documents: [
      { name: 'Architectural Drawings.pdf', url: 'https://example.com/arch.pdf', type: 'pdf' },
      { name: 'BOQ.xlsx', url: 'https://example.com/boq.xlsx', type: 'excel' }
    ],
    eligibility_criteria: {
      turnover: '₹2 Crore minimum annual turnover',
      experience: '5 years experience in school construction',
      registration: 'Registered with PWD/CPWD'
    },
    contact_details: {
      officer: 'Smt. Priya Sharma',
      designation: 'Executive Engineer',
      phone: '+91-80-87654321',
      email: 'ee.education@karnataka.gov.in'
    }
  },
  {
    tender_ref_no: 'GEM/2024/B/11111',
    title: 'Medical Equipment for District Hospital',
    description: 'Procurement of medical equipment including X-ray machines, ECG machines, patient monitors, and laboratory equipment for district hospital upgrade.',
    department: 'Ministry of Health & Family Welfare',
    state: 'Tamil Nadu',
    city: 'Chennai',
    budget_min: 3000000,
    budget_max: 5000000,
    publish_date: new Date('2024-01-25'),
    bid_deadline: new Date('2024-02-25'),
    category: 'Medical Equipment',
    source_portal: 'GeM',
    source_url: 'https://gem.gov.in/tender/11111',
    documents: [
      { name: 'Equipment Specifications.pdf', url: 'https://example.com/specs.pdf', type: 'pdf' }
    ],
    eligibility_criteria: {
      turnover: '₹1 Crore minimum annual turnover',
      experience: '3 years in medical equipment supply',
      certification: 'ISO 13485 certified'
    },
    contact_details: {
      officer: 'Dr. Suresh Babu',
      designation: 'Chief Medical Officer',
      phone: '+91-44-98765432',
      email: 'cmo.district@tn.gov.in'
    }
  },
  {
    tender_ref_no: 'STATE/2024/B/22222',
    title: 'Software Development for E-Governance Portal',
    description: 'Development of citizen services portal with online application submission, payment gateway integration, and mobile app development.',
    department: 'Ministry of Information Technology',
    state: 'Delhi',
    city: 'Delhi',
    budget_min: 2000000,
    budget_max: 4000000,
    publish_date: new Date('2024-02-01'),
    bid_deadline: new Date('2024-03-01'),
    category: 'Software Development',
    source_portal: 'State',
    source_url: 'https://delhi.gov.in/tender/22222',
    documents: [
      { name: 'Functional Requirements.pdf', url: 'https://example.com/func.pdf', type: 'pdf' },
      { name: 'Technical Architecture.pdf', url: 'https://example.com/tech.pdf', type: 'pdf' }
    ],
    eligibility_criteria: {
      turnover: '₹75 Lakh minimum annual turnover',
      experience: '4 years in government portal development',
      certification: 'CMMI Level 3 or higher'
    },
    contact_details: {
      officer: 'Shri Amit Singh',
      designation: 'Director (IT)',
      phone: '+91-11-23456789',
      email: 'director.it@delhi.gov.in'
    }
  },
  {
    tender_ref_no: 'GEM/2024/B/33333',
    title: 'Office Furniture and Equipment Supply',
    description: 'Supply of office furniture including desks, chairs, filing cabinets, and conference room furniture for new government office complex.',
    department: 'Ministry of Urban Development',
    state: 'Gujarat',
    city: 'Ahmedabad',
    budget_min: 800000,
    budget_max: 1500000,
    publish_date: new Date('2024-02-05'),
    bid_deadline: new Date('2024-03-05'),
    category: 'Office Supplies',
    source_portal: 'GeM',
    source_url: 'https://gem.gov.in/tender/33333',
    documents: [
      { name: 'Furniture Specifications.pdf', url: 'https://example.com/furniture.pdf', type: 'pdf' }
    ],
    eligibility_criteria: {
      turnover: '₹30 Lakh minimum annual turnover',
      experience: '2 years in office furniture supply',
      quality: 'ISI marked products required'
    },
    contact_details: {
      officer: 'Shri Kiran Patel',
      designation: 'Assistant Commissioner',
      phone: '+91-79-12345678',
      email: 'ac.urban@gujarat.gov.in'
    }
  }
];

// Sample admin user
const adminUser = {
  email: 'admin@tendermatch.pro',
  password: 'admin123456',
  company_name: 'TenderMatch Pro Admin',
  phone: '9876543210',
  preferences: {
    notifications: true,
    theme: 'light'
  }
};

// Sample regular user
const regularUser = {
  email: 'user@example.com',
  password: 'user123456',
  company_name: 'ABC Enterprises Pvt Ltd',
  gstin: '27ABCDE1234F1Z5',
  phone: '9123456789',
  preferences: {
    notifications: true,
    theme: 'light',
    categories: ['IT Equipment', 'Office Supplies']
  }
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Create admin user
    try {
      const admin = await User.create({
        ...adminUser,
        is_admin: true,
        is_verified: true
      });
      console.log('✅ Admin user created:', admin.email);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        throw error;
      }
    }

    // Create regular user
    try {
      const user = await User.create({
        ...regularUser,
        is_verified: true
      });
      console.log('✅ Regular user created:', user.email);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Regular user already exists');
      } else {
        throw error;
      }
    }

    // Create sample tenders
    let tendersCreated = 0;
    let tendersSkipped = 0;

    for (const tenderData of sampleTenders) {
      try {
        // Check if tender already exists
        const existingTender = await Tender.findByRefNo(tenderData.tender_ref_no);
        
        if (!existingTender) {
          await Tender.create(tenderData);
          tendersCreated++;
          console.log(`✅ Created tender: ${tenderData.tender_ref_no}`);
        } else {
          tendersSkipped++;
          console.log(`ℹ️  Tender already exists: ${tenderData.tender_ref_no}`);
        }
      } catch (error) {
        console.error(`❌ Error creating tender ${tenderData.tender_ref_no}:`, error.message);
      }
    }

    console.log(`\n🎉 Database seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Tenders created: ${tendersCreated}`);
    console.log(`   - Tenders skipped: ${tendersSkipped}`);
    console.log(`   - Admin user: admin@tendermatch.pro (password: admin123456)`);
    console.log(`   - Test user: user@example.com (password: user123456)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleTenders, adminUser, regularUser };