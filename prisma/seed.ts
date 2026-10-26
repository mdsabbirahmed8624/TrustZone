import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const BRANCH_DHANMONDI = 'd1111111-1111-1111-1111-111111111111';
const BRANCH_BANANI = 'b2222222-2222-2222-2222-222222222222';
const BRANCH_MIRPUR = 'c3333333-3333-3333-3333-333333333333';

async function main() {
  console.log('Seeding database starting...');

  // 1. Seed Branches
  const branches = [
    {
      id: BRANCH_DHANMONDI,
      name: 'Dhanmondi Head Office (Metro Shopping Mall)',
      address: 'Level 4, Shop #412, Metro Shopping Mall, Mirpur Road, Dhanmondi, Dhaka 1209',
      timezone: 'Asia/Dhaka',
      status: 'ACTIVE',
    },
    {
      id: BRANCH_BANANI,
      name: 'Banani Laboratory Branch (Road 11)',
      address: 'Level 2, Plot #45, Road 11, Banani, Dhaka 1213',
      timezone: 'Asia/Dhaka',
      status: 'ACTIVE',
    },
    {
      id: BRANCH_MIRPUR,
      name: 'Mirpur-10 Diagnostic Desk (Opposite Fire Station)',
      address: 'Level 1, Section 10, Sector C, Mirpur, Dhaka 1216',
      timezone: 'Asia/Dhaka',
      status: 'ACTIVE',
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: {},
      create: branch,
    });
  }
  console.log('Branches seeded.');

  // 2. Seed Roles and Permissions
  const roles = [
    {
      name: 'SUPER_ADMIN',
      description: 'Full system access override and root settings management',
      permissions: ['*'],
      isSystem: true,
    },
    {
      name: 'OWNER',
      description: 'Business owner with complete branch and financial access',
      permissions: ['*'],
      isSystem: true,
    },
    {
      name: 'ADMIN',
      description: 'General system administrator for branches and staff management',
      permissions: [
        'read:dashboard',
        'read:repairs', 'write:repairs',
        'read:bookings', 'write:bookings',
        'read:customers', 'write:customers',
        'read:technicians', 'write:technicians',
        'read:inventory', 'write:inventory',
        'read:suppliers', 'write:suppliers',
        'read:invoices', 'write:invoices',
        'read:warranty', 'write:warranty',
        'read:reports',
        'read:finance', 'write:finance', 'finance.read', 'finance.write', 'finance.settings', 'finance.approve', 'hr:read', 'hr:write',
        'read:marketing',
        'read:crm',
        'read:branches', 'write:branches',
        'read:settings', 'write:settings',
        'read:audit_logs',
        'read:api', 'write:api',
        'read:support'
      ],
      isSystem: true,
    },
    {
      name: 'MANAGER',
      description: 'Branch manager overseeing operations, staff, and repairs',
      permissions: [
        'read:dashboard',
        'read:repairs', 'write:repairs',
        'read:bookings', 'write:bookings',
        'read:customers', 'write:customers',
        'read:technicians',
        'read:inventory', 'write:inventory',
        'read:suppliers',
        'read:invoices', 'write:invoices',
        'read:warranty', 'write:warranty',
        'read:reports',
        'read:branches'
      ],
      isSystem: true,
    },
    {
      name: 'ACCOUNTANT',
      description: 'Financial accountant managing invoices, ledger, and tax reporting',
      permissions: [
        'read:dashboard',
        'read:invoices', 'write:invoices',
        'read:finance', 'write:finance', 'finance.read', 'finance.write', 'finance.settings', 'finance.approve', 'hr:read', 'hr:write', 'write:finance',
        'read:reports'
      ],
      isSystem: true,
    },
    {
      name: 'TECHNICIAN_MANAGER',
      description: 'Technical lead managing repair queues and technician allocations',
      permissions: [
        'read:dashboard',
        'read:repairs', 'write:repairs',
        'read:technicians', 'write:technicians',
        'read:inventory',
        'read:warranty'
      ],
      isSystem: true,
    },
    {
      name: 'INVENTORY_MANAGER',
      description: 'Stock manager tracking parts availability, buffer thresholds, and suppliers',
      permissions: [
        'read:dashboard',
        'read:inventory', 'write:inventory',
        'read:suppliers', 'write:suppliers'
      ],
      isSystem: true,
    },
    {
      name: 'SUPPORT',
      description: 'Customer service desk logging issues and booking diagnostics',
      permissions: [
        'read:dashboard',
        'read:bookings', 'write:bookings',
        'read:customers', 'write:customers',
        'read:warranty'
      ],
      isSystem: true,
    },
    {
      name: 'MARKETING',
      description: 'Campaign manager handling discounts, analytics, and CRM insights',
      permissions: [
        'read:dashboard',
        'read:customers',
        'read:marketing', 'write:marketing',
        'read:crm', 'write:crm'
      ],
      isSystem: true,
    },
    {
      name: 'TECHNICIAN',
      description: 'Technical staff diagnosing and executing device repairs',
      permissions: [
        'read:dashboard',
        'read:repairs', 'write:repairs',
        'read:inventory'
      ],
      isSystem: true,
    },
    {
      name: 'CUSTOM_ROLE',
      description: 'Customizable base template role',
      permissions: ['read:dashboard'],
      isSystem: false,
    },
  ];

  const dbRoles: Record<string, string> = {};

  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permissions: role.permissions,
      },
      create: role,
    });
    dbRoles[role.name] = dbRole.id;
  }
  console.log('Roles seeded.');

  // 3. Cleanup all dynamic tables to avoid duplicate key issues during re-seeding
  await prisma.journalLine.deleteMany({});
  await prisma.journalEntry.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.income.deleteMany({});
  await prisma.accountTransfer.deleteMany({});
  await prisma.accountAdjustment.deleteMany({});
  await prisma.dailyClosing.deleteMany({});
  await prisma.financialAccount.deleteMany({});
  await prisma.accountingPeriod.deleteMany({});
  await prisma.fiscalYear.deleteMany({});
  await prisma.stockTransfer.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.supplierLedger.deleteMany({});
  await prisma.customerCommunication.deleteMany({});
  await prisma.customerDocument.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.ticketHistory.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.device.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.branchInventory.deleteMany({});
  await prisma.part.deleteMany({});
  await prisma.supplier.deleteMany({});
  
  // Clean up users EXCEPT admin to avoid foreign key/audit log errors
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ['admin@trustzone.care']
      }
    }
  });

  console.log('Dynamic tables cleaned.');

  // 4. Seed default Super Admin User
  const adminEmail = 'admin@trustzone.care';
  const adminPasswordHash = await argon2.hash('Password123!');

  const defaultAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      roleId: dbRoles['SUPER_ADMIN'],
      role: 'SUPER_ADMIN',
      branchId: BRANCH_DHANMONDI,
      skills: ['Root Diagnostics', 'Network Repair'],
      certificationLevel: 'L4',
      rating: 5.0,
      isOnline: true,
    },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      roleId: dbRoles['SUPER_ADMIN'],
      branchId: BRANCH_DHANMONDI,
      isEmailVerified: true,
      skills: ['Root Diagnostics', 'Network Repair'],
      certificationLevel: 'L4',
      rating: 5.0,
      isOnline: true,
    },
  });
  console.log(`Default Super Admin user seeded: ${defaultAdmin.email}`);

  // 5. Seed ADMIN test user (Banani Branch)
  const adminUserHash = await argon2.hash('AdminPass123!');
  await prisma.user.create({
    data: {
      email: 'branch.admin@trustzone.care',
      password: adminUserHash,
      firstName: 'Rafiq',
      lastName: 'Ahmed',
      role: 'ADMIN',
      roleId: dbRoles['ADMIN'],
      branchId: BRANCH_BANANI,
      isEmailVerified: true,
      skills: ['QC Audits', 'Customer Handover'],
      certificationLevel: 'L2',
      rating: 4.8,
      isOnline: true,
    },
  });

  // 6. Seed MANAGER test user (Mirpur Branch)
  const managerHash = await argon2.hash('ManagerPass123!');
  await prisma.user.create({
    data: {
      email: 'mirpur.manager@trustzone.care',
      password: managerHash,
      firstName: 'Nazma',
      lastName: 'Khatun',
      role: 'MANAGER',
      roleId: dbRoles['MANAGER'],
      branchId: BRANCH_MIRPUR,
      isEmailVerified: true,
      skills: ['Operations Management'],
      certificationLevel: 'L2',
      rating: 4.7,
      isOnline: false,
    },
  });

  // 7. Seed TECHNICIAN test users
  const techHash = await argon2.hash('TechPass123!');
  const techDhanmondi = await prisma.user.create({
    data: {
      email: 'tech.dhanmondi@trustzone.care',
      password: techHash,
      firstName: 'Kamal',
      lastName: 'Uddin',
      role: 'TECHNICIAN',
      roleId: dbRoles['TECHNICIAN'],
      branchId: BRANCH_DHANMONDI,
      isEmailVerified: true,
      skills: ['OLED Screen Replacement', 'Battery Calibration', 'Camera Alignment'],
      certificationLevel: 'L3',
      rating: 4.9,
      isOnline: true,
    },
  });

  const techBanani = await prisma.user.create({
    data: {
      email: 'tech.banani@trustzone.care',
      password: techHash,
      firstName: 'Jamil',
      lastName: 'Hasan',
      role: 'TECHNICIAN',
      roleId: dbRoles['TECHNICIAN'],
      branchId: BRANCH_BANANI,
      isEmailVerified: true,
      skills: ['Micro-soldering', 'IC Reballing', 'Liquid Damage Restoration'],
      certificationLevel: 'L4',
      rating: 4.95,
      isOnline: false,
    },
  });
  console.log('Technicians seeded.');

  // 8. Seed Attendance (Last 7 Days)
  const today = new Date();
  const techIds = [techDhanmondi.id, techBanani.id];
  for (let i = 0; i < 7; i++) {
    const logDate = new Date();
    logDate.setDate(today.getDate() - i);
    // Skip Fridays (standard weekend)
    if (logDate.getDay() === 5) continue;

    for (const userId of techIds) {
      const isLate = Math.random() > 0.85;
      await prisma.attendance.create({
        data: {
          userId,
          date: logDate,
          status: isLate ? 'late' : 'present',
          checkIn: new Date(logDate.setHours(isLate ? 10 : 9, isLate ? 15 : 0, 0, 0)),
          checkOut: new Date(logDate.setHours(18, 0, 0, 0)),
        }
      });
    }
  }
  console.log('Attendance records seeded.');

  // 9. Seed Leave Requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: techBanani.id,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
        reason: 'Family medical issue in village.',
        status: 'approved',
      },
      {
        userId: techDhanmondi.id,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
        reason: 'Personal engagement.',
        status: 'pending',
      }
    ]
  });
  console.log('Leaves seeded.');

  // 10. Seed Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Dhaka Parts Plaza Ltd.',
      email: 'sales@dhakapartsplaza.com',
      phone: '01912998877',
      contactPerson: 'Abul Hashem',
      address: 'Shop #32, Ground Floor, Eastern Plaza, Hatirpool, Dhaka',
      rating: 4.8,
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Mobile Core China Import House',
      email: 'imports@mobilecore.com.bd',
      phone: '01844221100',
      contactPerson: 'Li Wei / Shamim Rahman',
      address: 'Level 2, Multiplan Centre, Elephant Road, Dhaka',
      rating: 4.5,
    }
  });
  console.log('Suppliers seeded.');

  // 11. Seed Supplier Ledger Records
  await prisma.supplierLedger.createMany({
    data: [
      {
        supplierId: supplier1.id,
        amount: 85000.00,
        type: 'CREDIT',
        reference: 'Initial inventory shipment bulk order',
      },
      {
        supplierId: supplier1.id,
        amount: 50000.00,
        type: 'DEBIT',
        reference: 'Bkash corporate transaction payment',
      }
    ]
  });
  console.log('Supplier ledger seeded.');

  // 12. Seed Parts
  const partsData = [
    {
      sku: 'SCRN-IPH14P',
      name: 'iPhone 14 Pro Original Screen Panel',
      category: 'Display',
      brand: 'Apple',
      brandCompatibility: 'Apple',
      modelCompatibility: ['iPhone 14 Pro', 'iPhone 14 Pro Max'],
      basePrice: 22000.00,
      minimumStockBuffer: 4,
      supplierId: supplier2.id,
    },
    {
      sku: 'GLASS-BACK-IPH14P',
      name: 'iPhone 14 Pro Laser Back Glass Panel',
      category: 'Body Glass',
      brand: 'Apple',
      brandCompatibility: 'Apple',
      modelCompatibility: ['iPhone 14 Pro'],
      basePrice: 4500.00,
      minimumStockBuffer: 3,
      supplierId: supplier1.id,
    },
    {
      sku: 'BATT-S23U',
      name: 'Samsung Galaxy S23 Ultra Original Battery 5000mAh',
      category: 'Battery',
      brand: 'Samsung',
      brandCompatibility: 'Samsung',
      modelCompatibility: ['Galaxy S23 Ultra'],
      basePrice: 6500.00,
      minimumStockBuffer: 5,
      supplierId: supplier1.id,
    },
    {
      sku: 'SCRN-S23U',
      name: 'Samsung Galaxy S23 Ultra OLED Panel with Frame Assembly',
      category: 'Display',
      brand: 'Samsung',
      brandCompatibility: 'Samsung',
      modelCompatibility: ['Galaxy S23 Ultra'],
      basePrice: 15500.00,
      minimumStockBuffer: 2,
      supplierId: supplier2.id,
    }
  ];

  const dbParts: Record<string, string> = {};
  for (const part of partsData) {
    const createdPart = await prisma.part.create({
      data: part
    });
    dbParts[part.sku] = createdPart.id;
  }
  console.log('Parts seeded.');

  // 13. Seed Branch Inventories (Stock levels)
  const branchInventories = [
    // Dhanmondi
    { branchId: BRANCH_DHANMONDI, partId: dbParts['SCRN-IPH14P'], quantity: 8, binLocation: 'Shelf A1-Dhanmondi' },
    { branchId: BRANCH_DHANMONDI, partId: dbParts['GLASS-BACK-IPH14P'], quantity: 1, binLocation: 'Shelf A3-Dhanmondi' }, // Low stock
    { branchId: BRANCH_DHANMONDI, partId: dbParts['BATT-S23U'], quantity: 15, binLocation: 'Shelf B2-Dhanmondi' },
    { branchId: BRANCH_DHANMONDI, partId: dbParts['SCRN-S23U'], quantity: 6, binLocation: 'Shelf C1-Dhanmondi' },

    // Banani
    { branchId: BRANCH_BANANI, partId: dbParts['SCRN-IPH14P'], quantity: 5, binLocation: 'Shelf B4-Banani' },
    { branchId: BRANCH_BANANI, partId: dbParts['GLASS-BACK-IPH14P'], quantity: 4, binLocation: 'Shelf B6-Banani' },
    { branchId: BRANCH_BANANI, partId: dbParts['BATT-S23U'], quantity: 2, binLocation: 'Shelf C2-Banani' }, // Low stock
    { branchId: BRANCH_BANANI, partId: dbParts['SCRN-S23U'], quantity: 1, binLocation: 'Shelf C3-Banani' }, // Low stock
  ];

  for (const bi of branchInventories) {
    await prisma.branchInventory.create({
      data: bi
    });
  }
  console.log('Branch stock levels seeded.');

  // 14. Seed Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        branchId: BRANCH_DHANMONDI,
        partId: dbParts['SCRN-IPH14P'],
        quantityDelta: 10,
        type: 'purchase_receipt',
      },
      {
        branchId: BRANCH_DHANMONDI,
        partId: dbParts['GLASS-BACK-IPH14P'],
        quantityDelta: 5,
        type: 'purchase_receipt',
      }
    ]
  });
  console.log('Stock movements seeded.');

  // 15. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      firstName: 'Rafiq',
      lastName: 'Karim',
      email: 'rafiq.k@gmail.com',
      phone: '01711122233',
      branchId: BRANCH_DHANMONDI,
      loyaltyPoints: 120,
      tags: ['VIP', 'Corporate'],
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      firstName: 'Sultana',
      lastName: 'Rahman',
      email: 'sultana.r@gmail.com',
      phone: '01822233344',
      branchId: BRANCH_BANANI,
      loyaltyPoints: 80,
      tags: ['Regular'],
    },
  });

  // Blacklisted mock user to verify filter
  await prisma.customer.create({
    data: {
      firstName: 'Kader',
      lastName: 'Mollah',
      email: 'kader.blacklist@gmail.com',
      phone: '01999887766',
      branchId: BRANCH_MIRPUR,
      loyaltyPoints: 0,
      tags: ['Blacklisted'],
    }
  });
  console.log('Customers seeded.');

  // 16. Seed Customer Communication Logs & Mock Documents
  await prisma.customerCommunication.createMany({
    data: [
      {
        customerId: customer1.id,
        type: 'SMS',
        message: 'Your iPhone 14 Pro ticket #ticket-3 has been registered.',
        status: 'sent',
      },
      {
        customerId: customer1.id,
        type: 'WhatsApp',
        message: 'Kamal has commenced hardware repairs on your display ribbon.',
        status: 'sent',
      }
    ]
  });

  await prisma.customerDocument.createMany({
    data: [
      {
        customerId: customer1.id,
        fileName: 'iPhone_14P_watermark_receipt.pdf',
        fileUrl: '/uploads/docs/iphone_receipt.pdf',
        fileSize: 450200, // 450 KB
      }
    ]
  });
  console.log('Customer communication & documents logs seeded.');

  // 17. Seed Devices
  const device1 = await prisma.device.create({
    data: {
      customerId: customer1.id,
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      serialNumber: 'SN-IPH14P-9982',
      imei: '358992110294812',
    },
  });

  const device2 = await prisma.device.create({
    data: {
      customerId: customer2.id,
      brand: 'Samsung',
      model: 'Galaxy S23 Ultra',
      serialNumber: 'SN-SAMS23-1123',
      imei: '357112009283112',
    },
  });
  console.log('Devices seeded.');

  // 18. Seed Tickets
  const sla1 = new Date(Date.now() + 24 * 3600 * 1000); 
  const sla2 = new Date(Date.now() + 48 * 3600 * 1000);
  const sla3 = new Date(Date.now() - 12 * 3600 * 1000); 

  // Ticket 1: Booked
  const ticket1 = await prisma.ticket.create({
    data: {
      branchId: BRANCH_DHANMONDI,
      customerId: customer1.id,
      deviceId: device1.id,
      status: 'booked',
      slaDeadline: sla1,
      estimatedCost: 0.00,
    },
  });
  await prisma.ticketHistory.create({
    data: {
      ticketId: ticket1.id,
      oldStatus: '',
      newStatus: 'booked',
      notes: 'Initial ticket generated from customer online booking desk.',
    },
  });

  // Ticket 2: Diagnosing
  const ticket2 = await prisma.ticket.create({
    data: {
      branchId: BRANCH_BANANI,
      customerId: customer2.id,
      deviceId: device2.id,
      assignedTechId: techBanani.id,
      status: 'diagnosing',
      slaDeadline: sla2,
      faults: ['Battery draining fast', 'Screen flickering occasionally'],
      tests: ['Screen: FAIL', 'Battery: FAIL', 'Charging Port: PASS', 'Audio: PASS', 'Camera: PASS', 'Buttons: PASS'],
      diagnosisNotes: 'Battery health checks at 72% capacity. Screen ribbon connector has minor oxidation; requires cleaning or replacement of display panel if flickering persists.',
      internalNotes: 'Advised customer to replace battery. Display ribbon connector will be cleaned first, screen replacement quoted as fallback.',
      partsRequired: ['BATT-S23U', 'SCRN-S23U'],
      estimatedCost: 18500.00,
      customerApproved: false,
    },
  });
  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: ticket2.id,
        oldStatus: '',
        newStatus: 'booked',
        notes: 'Walk-in booking logged at Banani Laboratory.',
      },
      {
        ticketId: ticket2.id,
        oldStatus: 'booked',
        newStatus: 'diagnosing',
        updatedById: techBanani.id,
        notes: 'Technician Jamil Hasan assigned. Initiating diagnostic assessment.',
      },
    ],
  });

  // Ticket 3: Repairing
  const ticket3 = await prisma.ticket.create({
    data: {
      branchId: BRANCH_DHANMONDI,
      customerId: customer1.id,
      deviceId: device1.id,
      assignedTechId: techDhanmondi.id,
      status: 'repairing',
      slaDeadline: sla1,
      faults: ['Shattered screen digitizer'],
      tests: ['Screen: FAIL', 'Battery: PASS', 'Charging Port: PASS', 'Audio: PASS', 'Camera: PASS', 'Buttons: PASS'],
      diagnosisNotes: 'Front screen glass shattered. OLED digitizer panel bleeding ink. Touch completely unresponsive.',
      internalNotes: 'Replacing front screen display assembly with original BDT-grade screen part.',
      partsRequired: ['SCRN-IPH14P'],
      estimatedCost: 24500.00,
      customerApproved: true,
      diagnosticCompletedAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
  });
  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: ticket3.id,
        oldStatus: '',
        newStatus: 'booked',
        notes: 'Booking logged at Dhanmondi Desk.',
      },
      {
        ticketId: ticket3.id,
        oldStatus: 'booked',
        newStatus: 'diagnosing',
        updatedById: techDhanmondi.id,
        notes: 'Technician Kamal Uddin assigned.',
      },
      {
        ticketId: ticket3.id,
        oldStatus: 'diagnosing',
        newStatus: 'repairing',
        updatedById: techDhanmondi.id,
        notes: 'Diagnostics completed. Estimate approved by customer. Parts allocated and repair process started.',
      },
    ],
  });

  // Ticket 4: Ready
  const ticket4 = await prisma.ticket.create({
    data: {
      branchId: BRANCH_DHANMONDI,
      customerId: customer1.id,
      deviceId: device1.id,
      assignedTechId: techDhanmondi.id,
      status: 'ready',
      slaDeadline: sla3,
      estimatedCost: 6500.00,
      customerApproved: true,
      diagnosticCompletedAt: new Date(Date.now() - 24 * 3600 * 1000),
      repairedAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  });
  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: ticket4.id,
        oldStatus: '',
        newStatus: 'booked',
        notes: 'Ticket logged.',
      },
      {
        ticketId: ticket4.id,
        oldStatus: 'booked',
        newStatus: 'diagnosing',
        updatedById: techDhanmondi.id,
        notes: 'Assigned to Kamal.',
      },
      {
        ticketId: ticket4.id,
        oldStatus: 'diagnosing',
        newStatus: 'repairing',
        notes: 'Laser separator run. Glass replaced.',
      },
      {
        ticketId: ticket4.id,
        oldStatus: 'repairing',
        newStatus: 'ready',
        updatedById: techDhanmondi.id,
        notes: 'Post-repair verification passed. Device ready for dispatch.',
      },
    ],
  });

  console.log('Tickets seeded.');

  // 19. Seed Purchase Orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      supplierId: supplier1.id,
      status: 'RECEIVED',
      paymentStatus: 'paid',
      totalAmount: 35000.00,
      branchId: BRANCH_DHANMONDI,
    }
  });

  await prisma.purchaseOrderItem.createMany({
    data: [
      {
        purchaseOrderId: po1.id,
        partId: dbParts['GLASS-BACK-IPH14P'],
        quantity: 10,
        quantityReceived: 10,
        unitCost: 3500.00,
      }
    ]
  });

  // Active Draft PO
  const po2 = await prisma.purchaseOrder.create({
    data: {
      supplierId: supplier2.id,
      status: 'DRAFT',
      paymentStatus: 'unpaid',
      totalAmount: 44000.00,
      branchId: BRANCH_DHANMONDI,
    }
  });

  await prisma.purchaseOrderItem.createMany({
    data: [
      {
        purchaseOrderId: po2.id,
        partId: dbParts['SCRN-IPH14P'],
        quantity: 2,
        quantityReceived: 0,
        unitCost: 22000.00,
      }
    ]
  });
  console.log('Purchase Orders seeded.');

  // 20. Seed Stock Transfers
  await prisma.stockTransfer.create({
    data: {
      fromBranchId: BRANCH_DHANMONDI,
      toBranchId: BRANCH_BANANI,
      partId: dbParts['SCRN-IPH14P'],
      quantity: 1,
      status: 'TRANSFERRED',
    }
  });

  await prisma.stockTransfer.create({
    data: {
      fromBranchId: BRANCH_DHANMONDI,
      toBranchId: BRANCH_MIRPUR,
      partId: dbParts['BATT-S23U'],
      quantity: 2,
      status: 'PENDING',
    }
  });
  console.log('Stock Transfers seeded.');

  // 21. Seed Fiscal Year & Accounting Periods
  const fy2026 = await prisma.fiscalYear.create({
    data: {
      name: 'FY2026',
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T23:59:59Z'),
      status: 'ACTIVE',
    },
  });

  const periodNames = [
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
    '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'
  ];

  for (let i = 0; i < 12; i++) {
    const startStr = `2026-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`;
    const endMonth = i === 11 ? 12 : i + 2;
    const endYear = i === 11 ? 2027 : 2026;
    const endDayStr = `01T00:00:00Z`;
    const endStr = `${endYear}-${String(endMonth).padStart(2, '0')}-${endDayStr}`;
    
    const startD = new Date(startStr);
    const endD = new Date(endStr);
    endD.setTime(endD.getTime() - 1000); // 1 second before next month

    await prisma.accountingPeriod.create({
      data: {
        fiscalYearId: fy2026.id,
        name: periodNames[i],
        startDate: startD,
        endDate: endD,
        isLocked: false,
      },
    });
  }
  console.log('Fiscal Year and Periods seeded.');

  // Helper function to create COA
  async function createAccount(
    number: string,
    name: string,
    accountClass: string,
    type: string,
    normalBalance: string,
    parentNum?: string,
    branchId?: string,
    openingBal = 0.00
  ) {
    let parentId = undefined;
    if (parentNum) {
      const parent = await prisma.financialAccount.findUnique({
        where: { accountNumber: parentNum },
      });
      if (parent) parentId = parent.id;
    }

    return prisma.financialAccount.create({
      data: {
        accountNumber: number,
        name,
        accountClass,
        accountType: type,
        normalBalance,
        parentAccountId: parentId,
        branchId,
        openingBalance: openingBal,
        currentBalance: openingBal,
      },
    });
  }

  // 22. Seed Chart of Accounts
  // Root level accounts
  await createAccount('1000', 'Current Assets', 'ASSET', 'ASSET', 'DEBIT');
  await createAccount('2000', 'Current Liabilities', 'LIABILITY', 'LIABILITY', 'CREDIT');
  await createAccount('3000', 'Equity', 'EQUITY', 'EQUITY', 'CREDIT');
  await createAccount('4000', 'Operating Revenue', 'INCOME', 'INCOME', 'CREDIT');
  await createAccount('5000', 'Operating Expenses', 'EXPENSE', 'EXPENSE', 'DEBIT');

  // Sub accounts
  await createAccount('1200', 'Accounts Receivable (Customer Dues)', 'ASSET', 'RECEIVABLE', 'DEBIT', '1000', undefined, 0.00);
  await createAccount('1300', 'Inventory Asset', 'ASSET', 'INVENTORY', 'DEBIT', '1000', undefined, 100000.00);
  await createAccount('2100', 'Accounts Payable (Supplier Dues)', 'LIABILITY', 'PAYABLE', 'CREDIT', '2000', undefined, 0.00);
  await createAccount('3100', 'Retained Earnings', 'EQUITY', 'EQUITY', 'CREDIT', '3000', undefined, 0.00);
  
  // Revenue accounts
  await createAccount('4010', 'Repair Service Income', 'INCOME', 'REVENUE', 'CREDIT', '4000');
  await createAccount('4020', 'Product Sales Revenue', 'INCOME', 'REVENUE', 'CREDIT', '4000');
  await createAccount('4030', 'Service Charges', 'INCOME', 'REVENUE', 'CREDIT', '4000');
  await createAccount('4040', 'Delivery Charges', 'INCOME', 'REVENUE', 'CREDIT', '4000');
  await createAccount('4090', 'Other Income', 'INCOME', 'REVENUE', 'CREDIT', '4000');

  // Cost of Goods Sold
  await createAccount('5010', 'Cost of Goods Sold', 'EXPENSE', 'COGS', 'DEBIT', '5000');

  // Operating Expenses
  await createAccount('5110', 'Rent Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5120', 'Salary Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5130', 'Electricity Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5140', 'Internet Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5150', 'Marketing Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5160', 'Equipment Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5170', 'Transport Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5180', 'Maintenance Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');
  await createAccount('5190', 'Miscellaneous Expense', 'EXPENSE', 'EXPENSE', 'DEBIT', '5000');

  // Branch Specific Cash/Bank/Mobile Accounts
  const branchIds = [BRANCH_DHANMONDI, BRANCH_BANANI, BRANCH_MIRPUR];
  const branchShorts = ['DHAN', 'BANA', 'MIRP'];
  const branchNames = ['Dhanmondi', 'Banani', 'Mirpur'];

  for (let b = 0; b < 3; b++) {
    const bid = branchIds[b];
    const bsh = branchShorts[b];
    const bnm = branchNames[b];

    await createAccount(`1010-${bsh}`, `Cash on Hand (${bnm})`, 'ASSET', 'CASH', 'DEBIT', '1000', bid, 50000.00);
    await createAccount(`1020-${bsh}`, `City Bank A/C (${bnm})`, 'ASSET', 'BANK', 'DEBIT', '1000', bid, 500000.00);
    await createAccount(`1030-${bsh}`, `bKash Merchant (${bnm})`, 'ASSET', 'MOBILE_BANKING', 'DEBIT', '1000', bid, 20000.00);
    await createAccount(`1040-${bsh}`, `Nagad Personal (${bnm})`, 'ASSET', 'MOBILE_BANKING', 'DEBIT', '1000', bid, 10000.00);
    await createAccount(`1050-${bsh}`, `Rocket Personal (${bnm})`, 'ASSET', 'MOBILE_BANKING', 'DEBIT', '1000', bid, 5000.00);
  }

  console.log('Chart of Accounts seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
