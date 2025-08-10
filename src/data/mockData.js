export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const departments = [
  'Ministry of Education',
  'Ministry of Health & Family Welfare',
  'Ministry of Transport',
  'Ministry of Information Technology',
  'Ministry of Defence',
  'Ministry of Railways',
  'Ministry of Power',
  'Ministry of Agriculture',
  'Ministry of Rural Development',
  'Ministry of Urban Development'
];

export const categories = [
  'IT Equipment',
  'Construction',
  'Consultancy Services',
  'Medical Equipment',
  'Office Supplies',
  'Transportation',
  'Infrastructure',
  'Software Development'
];

export const mockTenders = [
  {
    id: 'GEM/2024/B/12001',
    title: 'Supply of Desktop Computers for Government Schools',
    department: 'Ministry of Education',
    state: 'Maharashtra',
    city: 'Mumbai',
    budget: 2500000,
    publishedDate: '2024-08-01',
    deadline: '2024-08-25',
    status: 'Active',
    category: 'IT Equipment',
    description: 'Procurement of 500 desktop computers with specifications as per tender document for government schools in Mumbai district.',
    eligibility: 'Registered suppliers with minimum 3 years experience in IT equipment supply',
    documents: ['Technical Specifications', 'Financial Bid Format', 'Terms & Conditions'],
    importantDates: {
      'Document Download Start': '2024-08-01',
      'Pre-bid Meeting': '2024-08-10',
      'Bid Submission Deadline': '2024-08-25',
      'Technical Bid Opening': '2024-08-26'
    }
  },
  {
    id: 'GEM/2024/B/12002',
    title: 'Construction of Primary Health Center Building',
    department: 'Ministry of Health & Family Welfare',
    state: 'Karnataka',
    city: 'Bangalore',
    budget: 15000000,
    publishedDate: '2024-07-28',
    deadline: '2024-08-20',
    status: 'Closing Soon',
    category: 'Construction',
    description: 'Construction of new Primary Health Center building with modern facilities and equipment.',
    eligibility: 'Class A contractors with experience in healthcare infrastructure',
    documents: ['Architectural Drawings', 'BOQ', 'Contract Terms'],
    importantDates: {
      'Document Download Start': '2024-07-28',
      'Site Visit': '2024-08-05',
      'Bid Submission Deadline': '2024-08-20',
      'Technical Bid Opening': '2024-08-21'
    }
  },
  {
    id: 'GEM/2024/B/12003',
    title: 'IT Consultancy Services for Digital India Initiative',
    department: 'Ministry of Information Technology',
    state: 'Delhi',
    city: 'New Delhi',
    budget: 8500000,
    publishedDate: '2024-08-05',
    deadline: '2024-08-30',
    status: 'Active',
    category: 'Consultancy Services',
    description: 'Comprehensive IT consultancy services for implementing digital governance solutions.',
    eligibility: 'IT companies with CMMI Level 3 certification and 5+ years experience',
    documents: ['Scope of Work', 'Technical Requirements', 'Evaluation Criteria'],
    importantDates: {
      'Document Download Start': '2024-08-05',
      'Clarification Deadline': '2024-08-15',
      'Bid Submission Deadline': '2024-08-30',
      'Technical Presentation': '2024-09-02'
    }
  },
  {
    id: 'GEM/2024/B/12004',
    title: 'Medical Equipment for District Hospital',
    department: 'Ministry of Health & Family Welfare',
    state: 'Tamil Nadu',
    city: 'Chennai',
    budget: 12000000,
    publishedDate: '2024-07-25',
    deadline: '2024-08-15',
    status: 'Closing Soon',
    category: 'Medical Equipment',
    description: 'Procurement of advanced medical equipment including MRI, CT Scan, and other diagnostic equipment.',
    eligibility: 'Authorized dealers of medical equipment with ISO certification',
    documents: ['Equipment Specifications', 'Installation Requirements', 'Warranty Terms'],
    importantDates: {
      'Document Download Start': '2024-07-25',
      'Pre-bid Meeting': '2024-08-02',
      'Bid Submission Deadline': '2024-08-15',
      'Technical Evaluation': '2024-08-16'
    }
  },
  {
    id: 'GEM/2024/B/12005',
    title: 'Office Furniture and Equipment Supply',
    department: 'Ministry of Rural Development',
    state: 'Gujarat',
    city: 'Ahmedabad',
    budget: 3500000,
    publishedDate: '2024-08-03',
    deadline: '2024-08-28',
    status: 'Active',
    category: 'Office Supplies',
    description: 'Supply of office furniture, computers, and other equipment for new rural development office.',
    eligibility: 'Suppliers with GST registration and minimum 2 years experience',
    documents: ['Item List', 'Quality Standards', 'Delivery Schedule'],
    importantDates: {
      'Document Download Start': '2024-08-03',
      'Sample Submission': '2024-08-12',
      'Bid Submission Deadline': '2024-08-28',
      'Commercial Bid Opening': '2024-08-29'
    }
  },
  {
    id: 'GEM/2024/B/12006',
    title: 'Road Construction and Maintenance Services',
    department: 'Ministry of Transport',
    state: 'Rajasthan',
    city: 'Jaipur',
    budget: 25000000,
    publishedDate: '2024-07-30',
    deadline: '2024-08-22',
    status: 'Active',
    category: 'Construction',
    description: 'Construction and maintenance of rural roads under PMGSY scheme.',
    eligibility: 'Class A contractors with road construction experience',
    documents: ['Technical Specifications', 'Work Schedule', 'Safety Guidelines'],
    importantDates: {
      'Document Download Start': '2024-07-30',
      'Site Inspection': '2024-08-08',
      'Bid Submission Deadline': '2024-08-22',
      'Bid Opening': '2024-08-23'
    }
  },
  {
    id: 'GEM/2024/B/12007',
    title: 'Software Development for E-Governance Portal',
    department: 'Ministry of Information Technology',
    state: 'Telangana',
    city: 'Hyderabad',
    budget: 18000000,
    publishedDate: '2024-08-02',
    deadline: '2024-08-27',
    status: 'Active',
    category: 'Software Development',
    description: 'Development of comprehensive e-governance portal with citizen services integration.',
    eligibility: 'Software companies with experience in government projects',
    documents: ['Functional Requirements', 'Technical Architecture', 'Project Timeline'],
    importantDates: {
      'Document Download Start': '2024-08-02',
      'Technical Discussion': '2024-08-12',
      'Bid Submission Deadline': '2024-08-27',
      'Demo Presentation': '2024-08-30'
    }
  },
  {
    id: 'GEM/2024/B/12008',
    title: 'Transportation Services for Government Employees',
    department: 'Ministry of Transport',
    state: 'West Bengal',
    city: 'Kolkata',
    budget: 6500000,
    publishedDate: '2024-08-04',
    deadline: '2024-08-29',
    status: 'Active',
    category: 'Transportation',
    description: 'Providing transportation services for government employees including vehicle maintenance.',
    eligibility: 'Transport companies with valid permits and insurance',
    documents: ['Service Requirements', 'Vehicle Specifications', 'Rate Schedule'],
    importantDates: {
      'Document Download Start': '2024-08-04',
      'Vehicle Inspection': '2024-08-14',
      'Bid Submission Deadline': '2024-08-29',
      'Contract Award': '2024-09-05'
    }
  },
  {
    id: 'GEM/2024/B/12009',
    title: 'Power Grid Infrastructure Development',
    department: 'Ministry of Power',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    budget: 45000000,
    publishedDate: '2024-07-26',
    deadline: '2024-08-18',
    status: 'Closing Soon',
    category: 'Infrastructure',
    description: 'Development of power grid infrastructure including substations and transmission lines.',
    eligibility: 'Electrical contractors with power sector experience',
    documents: ['Technical Drawings', 'Equipment List', 'Safety Protocols'],
    importantDates: {
      'Document Download Start': '2024-07-26',
      'Pre-qualification': '2024-08-05',
      'Bid Submission Deadline': '2024-08-18',
      'Technical Evaluation': '2024-08-20'
    }
  },
  {
    id: 'GEM/2024/B/12010',
    title: 'Agricultural Equipment Supply for Farmers',
    department: 'Ministry of Agriculture',
    state: 'Punjab',
    city: 'Chandigarh',
    budget: 8000000,
    publishedDate: '2024-08-01',
    deadline: '2024-08-26',
    status: 'Active',
    category: 'Office Supplies',
    description: 'Supply of modern agricultural equipment and machinery for farmer welfare schemes.',
    eligibility: 'Agricultural equipment dealers with manufacturer authorization',
    documents: ['Equipment Catalog', 'Warranty Terms', 'Training Manual'],
    importantDates: {
      'Document Download Start': '2024-08-01',
      'Equipment Demo': '2024-08-11',
      'Bid Submission Deadline': '2024-08-26',
      'Supplier Selection': '2024-08-28'
    }
  },
  {
    id: 'GEM/2024/B/12011',
    title: 'Hospital Management Software Implementation',
    department: 'Ministry of Health & Family Welfare',
    state: 'Kerala',
    city: 'Kochi',
    budget: 9500000,
    publishedDate: '2024-08-06',
    deadline: '2024-08-31',
    status: 'Active',
    category: 'Software Development',
    description: 'Implementation of comprehensive hospital management system with patient records integration.',
    eligibility: 'Healthcare IT companies with hospital management experience',
    documents: ['System Requirements', 'Data Migration Plan', 'Training Schedule'],
    importantDates: {
      'Document Download Start': '2024-08-06',
      'System Demo': '2024-08-16',
      'Bid Submission Deadline': '2024-08-31',
      'Implementation Start': '2024-09-10'
    }
  },
  {
    id: 'GEM/2024/B/12012',
    title: 'School Building Construction Project',
    department: 'Ministry of Education',
    state: 'Madhya Pradesh',
    city: 'Bhopal',
    budget: 22000000,
    publishedDate: '2024-07-29',
    deadline: '2024-08-21',
    status: 'Active',
    category: 'Construction',
    description: 'Construction of new school building with modern classrooms and facilities.',
    eligibility: 'Construction companies with educational infrastructure experience',
    documents: ['Architectural Plans', 'Structural Drawings', 'Quality Standards'],
    importantDates: {
      'Document Download Start': '2024-07-29',
      'Site Survey': '2024-08-07',
      'Bid Submission Deadline': '2024-08-21',
      'Contract Signing': '2024-08-25'
    }
  },
  {
    id: 'GEM/2024/B/12013',
    title: 'IT Security Audit and Consultancy',
    department: 'Ministry of Information Technology',
    state: 'Haryana',
    city: 'Gurgaon',
    budget: 4500000,
    publishedDate: '2024-08-07',
    deadline: '2024-09-01',
    status: 'Active',
    category: 'Consultancy Services',
    description: 'Comprehensive IT security audit and consultancy services for government systems.',
    eligibility: 'Cybersecurity firms with government sector experience',
    documents: ['Audit Scope', 'Security Standards', 'Compliance Requirements'],
    importantDates: {
      'Document Download Start': '2024-08-07',
      'Security Briefing': '2024-08-17',
      'Bid Submission Deadline': '2024-09-01',
      'Audit Commencement': '2024-09-05'
    }
  },
  {
    id: 'GEM/2024/B/12014',
    title: 'Medical Supplies for Rural Health Centers',
    department: 'Ministry of Health & Family Welfare',
    state: 'Odisha',
    city: 'Bhubaneswar',
    budget: 7500000,
    publishedDate: '2024-07-31',
    deadline: '2024-08-24',
    status: 'Active',
    category: 'Medical Equipment',
    description: 'Supply of essential medical supplies and equipment for rural health centers.',
    eligibility: 'Medical suppliers with drug license and quality certifications',
    documents: ['Supply List', 'Quality Certificates', 'Delivery Schedule'],
    importantDates: {
      'Document Download Start': '2024-07-31',
      'Quality Inspection': '2024-08-10',
      'Bid Submission Deadline': '2024-08-24',
      'Supply Commencement': '2024-08-30'
    }
  },
  {
    id: 'GEM/2024/B/12015',
    title: 'Digital Library Setup for Universities',
    department: 'Ministry of Education',
    state: 'Assam',
    city: 'Guwahati',
    budget: 11000000,
    publishedDate: '2024-08-05',
    deadline: '2024-08-30',
    status: 'Active',
    category: 'IT Equipment',
    description: 'Setup of digital library infrastructure with e-books and online resources access.',
    eligibility: 'Educational technology providers with library management experience',
    documents: ['Technical Specifications', 'Content Requirements', 'User Training Plan'],
    importantDates: {
      'Document Download Start': '2024-08-05',
      'Content Review': '2024-08-15',
      'Bid Submission Deadline': '2024-08-30',
      'Installation Start': '2024-09-05'
    }
  },
  {
    id: 'GEM/2024/B/12016',
    title: 'Water Treatment Plant Construction',
    department: 'Ministry of Urban Development',
    state: 'Jharkhand',
    city: 'Ranchi',
    budget: 35000000,
    publishedDate: '2024-07-27',
    deadline: '2024-08-19',
    status: 'Closing Soon',
    category: 'Infrastructure',
    description: 'Construction of water treatment plant with modern filtration and purification systems.',
    eligibility: 'Water treatment specialists with environmental clearances',
    documents: ['Technical Specifications', 'Environmental Impact', 'Operation Manual'],
    importantDates: {
      'Document Download Start': '2024-07-27',
      'Environmental Review': '2024-08-06',
      'Bid Submission Deadline': '2024-08-19',
      'Project Commencement': '2024-08-25'
    }
  },
  {
    id: 'GEM/2024/B/12017',
    title: 'Vehicle Fleet Management System',
    department: 'Ministry of Transport',
    state: 'Himachal Pradesh',
    city: 'Shimla',
    budget: 5500000,
    publishedDate: '2024-08-08',
    deadline: '2024-09-02',
    status: 'Active',
    category: 'Software Development',
    description: 'Development and implementation of vehicle fleet management system with GPS tracking.',
    eligibility: 'Software companies with fleet management solution experience',
    documents: ['System Requirements', 'Integration Specifications', 'User Manual'],
    importantDates: {
      'Document Download Start': '2024-08-08',
      'System Demo': '2024-08-18',
      'Bid Submission Deadline': '2024-09-02',
      'Go-live Date': '2024-09-15'
    }
  },
  {
    id: 'GEM/2024/B/12018',
    title: 'Solar Power Installation for Government Buildings',
    department: 'Ministry of Power',
    state: 'Rajasthan',
    city: 'Jodhpur',
    budget: 28000000,
    publishedDate: '2024-08-03',
    deadline: '2024-08-28',
    status: 'Active',
    category: 'Infrastructure',
    description: 'Installation of solar power systems on government buildings for renewable energy.',
    eligibility: 'Solar energy companies with government project experience',
    documents: ['Technical Specifications', 'Installation Plan', 'Maintenance Agreement'],
    importantDates: {
      'Document Download Start': '2024-08-03',
      'Site Assessment': '2024-08-13',
      'Bid Submission Deadline': '2024-08-28',
      'Installation Start': '2024-09-05'
    }
  },
  {
    id: 'GEM/2024/B/12019',
    title: 'Laboratory Equipment for Research Institute',
    department: 'Ministry of Education',
    state: 'Karnataka',
    city: 'Mysore',
    budget: 16500000,
    publishedDate: '2024-08-04',
    deadline: '2024-08-29',
    status: 'Active',
    category: 'Medical Equipment',
    description: 'Supply of advanced laboratory equipment for research and development activities.',
    eligibility: 'Scientific equipment suppliers with research institute experience',
    documents: ['Equipment List', 'Technical Specifications', 'Calibration Requirements'],
    importantDates: {
      'Document Download Start': '2024-08-04',
      'Technical Evaluation': '2024-08-14',
      'Bid Submission Deadline': '2024-08-29',
      'Equipment Delivery': '2024-09-10'
    }
  },
  {
    id: 'GEM/2024/B/12020',
    title: 'Waste Management System Implementation',
    department: 'Ministry of Urban Development',
    state: 'Goa',
    city: 'Panaji',
    budget: 13500000,
    publishedDate: '2024-08-06',
    deadline: '2024-08-31',
    status: 'Active',
    category: 'Infrastructure',
    description: 'Implementation of comprehensive waste management system with recycling facilities.',
    eligibility: 'Environmental management companies with waste processing experience',
    documents: ['System Design', 'Environmental Compliance', 'Operation Plan'],
    importantDates: {
      'Document Download Start': '2024-08-06',
      'Environmental Clearance': '2024-08-16',
      'Bid Submission Deadline': '2024-08-31',
      'System Deployment': '2024-09-10'
    }
  }
];