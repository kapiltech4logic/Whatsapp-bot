import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Organization from './src/models/Organization.js';
import Project from './src/models/Project.js';
import PlatformUser from './src/models/PlatformUser.js';
import User from './src/models/User.js';
import Session from './src/models/Session.js';
import SessionFlow from './src/models/SessionFlow.js';
import ChatMessage from './src/models/ChatMessage.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:adminpassword@localhost:27017/uniserve_mvp_db?authSource=admin';

// Helper functions
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Dummy data
const organizations = [
  {
    _id: new mongoose.Types.ObjectId('676000000000000000000001'),
    name: 'TechCorp Solutions',
    slug: 'techcorp',
    tier: 'BUSINESS',
    status: 'ACTIVE',
    billingEmail: 'billing@techcorp.com',
    customizations: {
      theme: {
        primaryColor: '#007bff',
        logo: null,
        favicon: null
      },
      features: ['advanced_analytics', 'custom_reports', 'api_access'],
      integrations: []
    },
    limits: {
      maxProjects: 20,
      maxUsersPerProject: 5000,
      maxMessagesPerMonth: 100000
    }
  },
  {
    _id: new mongoose.Types.ObjectId('676000000000000000000002'),
    name: 'RetailCo Inc',
    slug: 'retailco',
    tier: 'STARTER',
    status: 'TRIAL',
    billingEmail: 'admin@retailco.com',
    customizations: {
      theme: {
        primaryColor: '#28a745',
        logo: null,
        favicon: null
      },
      features: ['basic_analytics'],
      integrations: []
    },
    limits: {
      maxProjects: 5,
      maxUsersPerProject: 1000,
      maxMessagesPerMonth: 10000
    },
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new mongoose.Types.ObjectId('676000000000000000000003'),
    name: 'HealthCare Plus',
    slug: 'healthcare-plus',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    billingEmail: 'billing@healthcareplus.com',
    customizations: {
      theme: {
        primaryColor: '#6f42c1',
        logo: null,
        favicon: null
      },
      features: ['advanced_analytics', 'custom_reports', 'api_access', 'webhooks', 'white_label'],
      integrations: []
    },
    limits: {
      maxProjects: -1, // unlimited
      maxUsersPerProject: -1,
      maxMessagesPerMonth: -1
    }
  }
];

const projects = [
  // TechCorp Projects (2 projects)
  {
    _id: new mongoose.Types.ObjectId('677000000000000000000001'),
    organizationId: new mongoose.Types.ObjectId('676000000000000000000001'),
    name: 'Customer Support Bot',
    slug: 'support-bot',
    type: 'WHATSAPP',
    settings: {
      whatsappConfig: {
        phoneNumberId: process.env.PHONE_NUMBER_ID || '',
        businessAccountId: '',
        webhookVerifyToken: process.env.VERIFY_TOKEN || ''
      }
    },
    features: ['basic_analytics', 'message_tracking', 'session_replay'],
    status: 'ACTIVE'
  },
  {
    _id: new mongoose.Types.ObjectId('677000000000000000000002'),
    organizationId: new mongoose.Types.ObjectId('676000000000000000000001'),
    name: 'Sales Assistant',
    slug: 'sales-assistant',
    type: 'WHATSAPP',
    settings: {},
    features: ['basic_analytics', 'message_tracking'],
    status: 'ACTIVE'
  },
  
  // RetailCo Projects (2 projects)
  {
    _id: new mongoose.Types.ObjectId('677000000000000000000003'),
    organizationId: new mongoose.Types.ObjectId('676000000000000000000002'),
    name: 'Order Tracking',
    slug: 'order-tracking',
    type: 'WHATSAPP',
    settings: {},
    features: ['basic_analytics', 'message_tracking'],
    status: 'ACTIVE'
  },
  {
    _id: new mongoose.Types.ObjectId('677000000000000000000004'),
    organizationId: new mongoose.Types.ObjectId('676000000000000000000002'),
    name: 'Product Catalog',
    slug: 'product-catalog',
    type: 'MOBILE',
    settings: {},
    features: ['basic_analytics'],
    status: 'ACTIVE'
  },
  
  // HealthCare Plus Projects (2 projects)
  {
    _id: new mongoose.Types.ObjectId('677000000000000000000005'),
    organizationId: new mongoose.Types.ObjectId('676000000000000000000003'),
    name: 'Patient Appointment System',
    slug: 'patient-appointments',
    type: 'WHATSAPP',
    settings: {},
    features: ['basic_analytics', 'message_tracking', 'session_replay', 'advanced_analytics'],
    status: 'ACTIVE'
  },
  {
    _id: new mongoose.Types.ObjectId('677000000000000000000006'),
    organizationId: new mongoose.Types.ObjectId('676000000000000000000003'),
    name: 'Prescription Reminders',
    slug: 'prescription-reminders',
    type: 'WHATSAPP',
    settings: {},
    features: ['basic_analytics', 'message_tracking'],
    status: 'ACTIVE'
  }
];

const platformUsers = [
  // Super Admin
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000001'),
    email: 'admin@uniserve.platform',
    password: 'SuperAdmin@2025', // Will be hashed automatically
    role: 'SUPER_ADMIN',
    organizationId: null,
    projectAccess: [],
    isActive: true,
    metadata: {
      firstName: 'Super',
      lastName: 'Admin'
    }
  },
  
  // TechCorp Users
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000002'),
    email: 'admin@techcorp.com',
    password: 'TechCorp@2025',
    role: 'ORG_ADMIN',
    organizationId: '676000000000000000000001',
    projectAccess: [],
    isActive: true,
    metadata: {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000003'),
    email: 'manager@techcorp.com',
    password: 'Manager@2025',
    role: 'PROJECT_MANAGER',
    organizationId: '676000000000000000000001',
    projectAccess: [
      {
        projectId: '677000000000000000000001',
        role: 'OWNER'
      },
      {
        projectId: '677000000000000000000002',
        role: 'ADMIN'
      }
    ],
    isActive: true,
    metadata: {
      firstName: 'Jane',
      lastName: 'Smith'
    }
  },
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000004'),
    email: 'viewer@techcorp.com',
    password: 'Viewer@2025',
    role: 'VIEWER',
    organizationId: '676000000000000000000001',
    projectAccess: [
      {
        projectId: '677000000000000000000001',
        role: 'VIEWER'
      }
    ],
    isActive: true,
    metadata: {
      firstName: 'Bob',
      lastName: 'Johnson'
    }
  },
  
  // RetailCo Users
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000005'),
    email: 'admin@retailco.com',
    password: 'RetailCo@2025',
    role: 'ORG_ADMIN',
    organizationId: '676000000000000000000002',
    projectAccess: [],
    isActive: true,
    metadata: {
      firstName: 'Alice',
      lastName: 'Williams'
    }
  },
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000006'),
    email: 'manager@retailco.com',
    password: 'RetailMgr@2025',
    role: 'PROJECT_MANAGER',
    organizationId: '676000000000000000000002',
    projectAccess: [
      {
        projectId: '677000000000000000000004',
        role: 'OWNER'
      }
    ],
    isActive: true,
    metadata: {
      firstName: 'Charlie',
      lastName: 'Brown'
    }
  },
  
  // HealthCare Plus Users
  {
    _id: new mongoose.Types.ObjectId('678000000000000000000007'),
    email: 'admin@healthcareplus.com',
    password: 'HealthCare@2025',
    role: 'ORG_ADMIN',
    organizationId: '676000000000000000000003',
    projectAccess: [],
    isActive: true,
    metadata: {
      firstName: 'Dr. Sarah',
      lastName: 'Miller'
    }
  }
];

// Seed function
async function seedData() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Organization.deleteMany({});
    await Project.deleteMany({});
    await PlatformUser.deleteMany({});
    await User.deleteMany({});
    await Session.deleteMany({});
    await SessionFlow.deleteMany({});
    await ChatMessage.deleteMany({});

    // Insert organizations
    console.log('📦 Inserting organizations...');
    await Organization.insertMany(organizations);
    console.log(`✅ Created ${organizations.length} organizations`);

    // Insert projects
    console.log('📦 Inserting projects...');
    await Project.insertMany(projects);
    console.log(`✅ Created ${projects.length} projects`);

    // Insert platform users
    console.log('📦 Inserting platform users...');
    for (const userData of platformUsers) {
      const user = new PlatformUser(userData);
      await user.save(); // This triggers password hashing
    }
    console.log(`✅ Created ${platformUsers.length} platform users`);

    // Generate end users and sessions for each project
    console.log('\n📦 Generating end users and sessions...');
    
    const flowSteps = ['WELCOME', 'MENU_MAIN', 'BROWSE_CATALOG', 'SEARCH', 'FAQ', 'CONTACT_SUPPORT', 'FEEDBACK', 'CHECKOUT', 'PAYMENT', 'ORDER_CONFIRMATION'];
    const sources = ['QR_CODE', 'DIRECT_LINK', 'AD_CLICK', 'REFERRAL', 'ORGANIC'];
    const languages = ['en', 'hi', 'gu', 'ta'];
    const names = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
      'Neha Reddy', 'Rahul Mehta', 'Pooja Iyer', 'Sanjay Joshi', 'Kavita Nair',
      'Arun Desai', 'Deepa Rao', 'Manish Verma', 'Divya Krishnan', 'Karthik Pillai',
      'Anita Kulkarni', 'Suresh Menon', 'Lakshmi Subramanian', 'Ravi Agarwal', 'Meera Shah'
    ];

    const baseDate = new Date('2024-12-01');
    const now = new Date();
    
    let totalUsers = 0;
    let totalSessions = 0;
    let totalMessages = 0;

    for (const project of projects) {
      const usersPerProject = randomInt(10, 15);
      console.log(`  Creating ${usersPerProject} users for project: ${project.name}`);

      for (let i = 0; i < usersPerProject; i++) {
        // Create user
        const phoneNumber = `+91${9000000000 + totalUsers}`;
        const userFirstSeen = randomDate(baseDate, now);
        
        const user = await User.create({
          phoneNumber,
          name: randomElement(names),
          language: randomElement(languages),
          userType: 'NEW', // Will be updated based on sessions
          firstSeen: userFirstSeen,
          lastActive: userFirstSeen,
          metadata: {
            projectId: project._id.toString(),
            projectName: project.name,
            organizationId: project.organizationId.toString(),
          },
        });

        totalUsers++;

        // Create 2-5 sessions per user
        const sessionsPerUser = randomInt(3, 7); // Increased from 2-5 to 3-7
        
        for (let j = 0; j < sessionsPerUser; j++) {
          const sessionStart = randomDate(userFirstSeen, now);
          const sessionDuration = randomInt(60, 900); // Increased from 30-600 to 60-900 (1-15 minutes)
          const sessionEnd = new Date(sessionStart.getTime() + sessionDuration * 1000);
          
          const session = await Session.create({
            userId: user._id,
            source: randomElement(sources),
            channel: project.type === 'MOBILE' ? 'MOBILE_APP' : project.type === 'WEB' ? 'WEB' : 'WHATSAPP',
            startTime: sessionStart,
            endTime: sessionEnd,
            durationSeconds: sessionDuration,
            isActive: false,
            metadata: {
              projectId: project._id.toString(),
              projectName: project.name,
              organizationId: project.organizationId,
            },
          });

          totalSessions++;

          // Create flow steps (3-10 steps per session) - More detailed flow
          const stepsCount = randomInt(4, 10); // Increased from 2-8 to 4-10
          const selectedSteps = [];
          
          // Always start with WELCOME
          selectedSteps.push('WELCOME');
          
          // Add random steps
          for (let k = 1; k < stepsCount; k++) {
            const availableSteps = flowSteps.filter(s => s !== 'WELCOME' && !selectedSteps.includes(s));
            if (availableSteps.length > 0) {
              selectedSteps.push(randomElement(availableSteps));
            }
          }

          // Create flow steps
          for (let k = 0; k < selectedSteps.length; k++) {
            const stepTime = new Date(sessionStart.getTime() + (sessionDuration / selectedSteps.length) * k * 1000);
            
            await SessionFlow.create({
              sessionId: session._id,
              flowStep: selectedSteps[k],
              stepOrder: k + 1,
              stepTimestamp: stepTime,
              stepData: {
                projectId: project._id.toString(),
                userSelection: `Option ${randomInt(1, 3)}`,
                stepDetails: `User completed ${selectedSteps[k]} step`,
                duration: Math.floor(sessionDuration / selectedSteps.length)
              },
            });
          }

          // Create chat messages (6-15 messages per session) - Increased messages
          const messagesCount = randomInt(6, 15); // Increased from 4-12
          
          for (let k = 0; k < messagesCount; k++) {
            const isUserMessage = k % 2 === 0;
            const messageTime = new Date(sessionStart.getTime() + (sessionDuration / messagesCount) * k * 1000);
            
            const userMessages = [
              'Hello', 'I need help', 'Show me products', 'What are my options?',
              'I want to place an order', 'Check order status', 'Track my order',
              'Need customer support', 'Help with payment', 'Thank you'
            ];
            
            const botMessages = [
              'Welcome! How can I assist you today?',
              'Here are your options: 1. Browse Products 2. Track Order 3. Contact Support',
              'I can help you with that. What would you like to know?',
              'Your order is being processed.',
              'Payment successful! Thank you for your order.',
              'Is there anything else I can help you with?',
              'Thank you for contacting us!',
              'Have a great day!'
            ];
            
            await ChatMessage.create({
              sessionId: session._id,
              sender: isUserMessage ? 'USER' : 'BOT',
              messageType: 'text',
              contentPayload: {
                text: isUserMessage ? randomElement(userMessages) : randomElement(botMessages),
              },
              isRead: true,
              createdAt: messageTime,
            });

            totalMessages++;
          }

          // Update user's last active
          user.lastActive = sessionEnd;
          await user.save();
        }

        // Update user type based on session count
        await user.updateUserType();
      }
    }

    console.log(`✅ Created ${totalUsers} end users`);
    console.log(`✅ Created ${totalSessions} sessions`);
    console.log(`✅ Created ${totalMessages} chat messages`);

    // Summary
    console.log('\n✨ Seed completed successfully!');
    console.log('\n📊 Database Statistics:');
    console.log('─'.repeat(60));
    console.log(`Organizations: ${organizations.length}`);
    console.log(`Projects: ${projects.length} (2 per organization)`);
    console.log(`Platform Users: ${platformUsers.length}`);
    console.log(`End Users: ${totalUsers} (10-15 per project)`);
    console.log(`Sessions: ${totalSessions} (2-5 per user)`);
    console.log(`Chat Messages: ${totalMessages} (4-12 per session)`);
    console.log(`Session Flows: ${totalSessions * 5} (avg 5 steps per session)`);
    console.log('─'.repeat(60));
    
    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(60));
    console.log('Super Admin:');
    console.log('  Email: admin@uniserve.platform');
    console.log('  Password: SuperAdmin@2025');
    console.log('');
    console.log('TechCorp Admin:');
    console.log('  Email: admin@techcorp.com');
    console.log('  Password: TechCorp@2025');
    console.log('');
    console.log('TechCorp Manager:');
    console.log('  Email: manager@techcorp.com');
    console.log('  Password: Manager@2025');
    console.log('');
    console.log('TechCorp Viewer:');
    console.log('  Email: viewer@techcorp.com');
    console.log('  Password: Viewer@2025');
    console.log('');
    console.log('RetailCo Admin:');
    console.log('  Email: admin@retailco.com');
    console.log('  Password: RetailCo@2025');
    console.log('');
    console.log('HealthCare Plus Admin:');
    console.log('  Email: admin@healthcareplus.com');
    console.log('  Password: HealthCare@2025');
    console.log('─'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedData();
