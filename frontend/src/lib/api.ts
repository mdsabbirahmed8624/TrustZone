/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Centralized API Client Wrapper for TrustZone Mobile Care
 * No page should call fetch() directly.
 * Includes a robust, fully interactive LocalStorage-based Mock Data Fallback
 * if the NestJS backend (http://localhost:4000/api/v1) is offline.
 */

const API_BASE = 'http://localhost:4000/api/v1';

export interface RequestOptions extends RequestInit {
  token?: string;
}

export interface RoleModel {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogModel {
  id: string;
  userId?: string | null;
  action: string;
  ipAddress: string | null;
  details: string | null;
  createdAt: string;
}

export interface AdminLoginData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    branchId: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CustomerModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

export interface DeviceModel {
  id: string;
  brand: string;
  model: string;
  serialNumber?: string | null;
  imei?: string | null;
}

export interface TicketHistoryModel {
  id: string;
  ticketId: string;
  oldStatus: string;
  newStatus: string;
  notes?: string | null;
  createdAt: string;
  updatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
}

export interface TicketModel {
  id: string;
  branchId: string;
  customerId: string;
  customer: CustomerModel;
  deviceId: string;
  device: DeviceModel;
  assignedTechId?: string | null;
  assignedTech?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  status: string;
  estimatedCost: number;
  slaDeadline: string;
  diagnosisNotes?: string | null;
  internalNotes?: string | null;
  faults: string[];
  tests: string[];
  photos: string[];
  partsRequired: string[];
  customerApproved: boolean;
  diagnosticCompletedAt?: string | null;
  repairedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  ticketHistory?: TicketHistoryModel[];
}

// ----------------------------------------------------
// Mock Data Store (LocalStorage) for stand-alone run
// ----------------------------------------------------
const MOCK_ROLES_KEY = 'tz_mock_roles';
const MOCK_AUDIT_LOGS_KEY = 'tz_mock_audit_logs';

const DEFAULT_MOCK_ROLES: RoleModel[] = [
  {
    id: 'role-1',
    name: 'SUPER_ADMIN',
    description: 'Full system access override and root settings management',
    permissions: ['*'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-2',
    name: 'OWNER',
    description: 'Business owner with complete branch and financial access',
    permissions: ['*'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-3',
    name: 'ADMIN',
    description: 'General system administrator for branches and staff management',
    permissions: [
      'read:dashboard', 'read:repairs', 'write:repairs', 'read:bookings', 'write:bookings',
      'read:customers', 'write:customers', 'read:technicians', 'write:technicians',
      'read:inventory', 'write:inventory', 'read:suppliers', 'write:suppliers',
      'read:invoices', 'write:invoices', 'read:warranty', 'write:warranty',
      'read:reports', 'read:finance', 'read:marketing', 'read:crm', 'read:branches',
      'write:branches', 'read:settings', 'write:settings', 'read:audit_logs',
      'read:api', 'write:api', 'read:support'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-4',
    name: 'MANAGER',
    description: 'Branch manager overseeing operations, staff, and repairs',
    permissions: [
      'read:dashboard', 'read:repairs', 'write:repairs', 'read:bookings', 'write:bookings',
      'read:customers', 'write:customers', 'read:technicians', 'read:inventory',
      'write:inventory', 'read:suppliers', 'read:invoices', 'write:invoices',
      'read:warranty', 'write:warranty', 'read:reports', 'read:branches'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-5',
    name: 'ACCOUNTANT',
    description: 'Financial accountant managing invoices, ledger, and tax reporting',
    permissions: ['read:dashboard', 'read:invoices', 'write:invoices', 'read:finance', 'write:finance', 'read:reports'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-6',
    name: 'TECHNICIAN_MANAGER',
    description: 'Technical lead managing repair queues and technician allocations',
    permissions: ['read:dashboard', 'read:repairs', 'write:repairs', 'read:technicians', 'write:technicians', 'read:inventory', 'read:warranty'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-7',
    name: 'INVENTORY_MANAGER',
    description: 'Stock manager tracking parts availability, buffer thresholds, and suppliers',
    permissions: ['read:dashboard', 'read:inventory', 'write:inventory', 'read:suppliers', 'write:suppliers'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-8',
    name: 'SUPPORT',
    description: 'Customer service desk logging issues and booking diagnostics',
    permissions: ['read:dashboard', 'read:bookings', 'write:bookings', 'read:customers', 'write:customers', 'read:warranty'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-9',
    name: 'MARKETING',
    description: 'Campaign manager handling discounts, analytics, and CRM insights',
    permissions: ['read:dashboard', 'read:customers', 'read:marketing', 'write:marketing', 'read:crm', 'write:crm'],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-10',
    name: 'CUSTOM_ROLE',
    description: 'Customizable base template role',
    permissions: ['read:dashboard'],
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const DEFAULT_MOCK_AUDIT_LOGS: AuditLogModel[] = [
  { id: 'log-1', action: 'admin_login_success', ipAddress: '103.113.152.63', details: '{"browser":"Chrome","device":"Desktop PC"}', createdAt: new Date(Date.now() - 5000).toISOString() },
  { id: 'log-2', action: 'permission_change', ipAddress: '103.113.152.63', details: '{"role":"MANAGER","updatedPermissions":["read:dashboard","read:repairs"]}', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-3', action: 'admin_login_success', ipAddress: '103.113.152.63', details: '{"browser":"Chrome","device":"Desktop PC"}', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'log-4', action: 'admin_login_failed', ipAddress: '192.168.1.1', details: '{"email":"admin@trustzone.care","reason":"Invalid password"}', createdAt: new Date(Date.now() - 90000000).toISOString() }
];

function getMockRoles(): RoleModel[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_ROLES;
  const stored = localStorage.getItem(MOCK_ROLES_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_ROLES_KEY, JSON.stringify(DEFAULT_MOCK_ROLES));
    return DEFAULT_MOCK_ROLES;
  }
  try {
    return JSON.parse(stored) as RoleModel[];
  } catch {
    return DEFAULT_MOCK_ROLES;
  }
}

function saveMockRoles(roles: RoleModel[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_ROLES_KEY, JSON.stringify(roles));
  }
}

function getMockAuditLogs(): AuditLogModel[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_AUDIT_LOGS;
  const stored = localStorage.getItem(MOCK_AUDIT_LOGS_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_AUDIT_LOGS_KEY, JSON.stringify(DEFAULT_MOCK_AUDIT_LOGS));
    return DEFAULT_MOCK_AUDIT_LOGS;
  }
  try {
    return JSON.parse(stored) as AuditLogModel[];
  } catch {
    return DEFAULT_MOCK_AUDIT_LOGS;
  }
}

function addMockAuditLog(action: string, details?: unknown) {
  if (typeof window !== 'undefined') {
    const logs = getMockAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      ipAddress: '127.0.0.1 (Local Mock)',
      details: details ? JSON.stringify(details) : null,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(MOCK_AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  }
}

const MOCK_TICKETS_KEY = 'tz_mock_tickets';

const DEFAULT_MOCK_TICKETS: TicketModel[] = [
  {
    id: 'ticket-1',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    customerId: 'cust-1',
    customer: { id: 'cust-1', firstName: 'Rafiq', lastName: 'Karim', email: 'rafiq.k@gmail.com', phone: '01711122233', loyaltyPoints: 120 },
    deviceId: 'dev-1',
    device: { id: 'dev-1', brand: 'Apple', model: 'iPhone 14 Pro', serialNumber: 'SN-IPH14P-9982', imei: '358992110294812' },
    status: 'booked',
    estimatedCost: 0.00,
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    faults: [],
    tests: [],
    photos: [],
    partsRequired: [],
    customerApproved: false,
    createdAt: new Date().toISOString(),
    ticketHistory: [
      { id: 'h-1', ticketId: 'ticket-1', oldStatus: '', newStatus: 'booked', notes: 'Initial ticket generated from customer online booking desk.', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 'ticket-2',
    branchId: 'b2222222-2222-2222-2222-222222222222',
    customerId: 'cust-2',
    customer: { id: 'cust-2', firstName: 'Sultana', lastName: 'Rahman', email: 'sultana.r@gmail.com', phone: '01822233344', loyaltyPoints: 80 },
    deviceId: 'dev-2',
    device: { id: 'dev-2', brand: 'Samsung', model: 'Galaxy S23 Ultra', serialNumber: 'SN-SAMS23-1123', imei: '357112009283112' },
    assignedTechId: 'branch-admin-uid-2222',
    assignedTech: { id: 'branch-admin-uid-2222', email: 'branch.admin@trustzone.care', firstName: 'Rafiq', lastName: 'Ahmed', role: 'ADMIN' },
    status: 'diagnosing',
    estimatedCost: 18500.00,
    slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    faults: ['Battery draining fast', 'Screen flickering occasionally'],
    tests: ['Screen: FAIL', 'Battery: FAIL', 'Charging Port: PASS', 'Audio: PASS', 'Camera: PASS', 'Buttons: PASS'],
    diagnosisNotes: 'Battery health checks at 72% capacity. Screen ribbon connector has minor oxidation; requires cleaning or replacement of display panel if flickering persists.',
    internalNotes: 'Advised customer to replace battery. Display ribbon connector will be cleaned first, screen replacement quoted as fallback.',
    photos: [],
    partsRequired: ['BATT-S23U', 'SCRN-S23U'],
    customerApproved: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    ticketHistory: [
      { id: 'h-2', ticketId: 'ticket-2', oldStatus: '', newStatus: 'booked', notes: 'Walk-in booking logged at Banani Laboratory.', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { id: 'h-3', ticketId: 'ticket-2', oldStatus: 'booked', newStatus: 'diagnosing', notes: 'Technician Rafiq Ahmed assigned. Initiating diagnostic assessment.', createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString() }
    ]
  },
  {
    id: 'ticket-3',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    customerId: 'cust-1',
    customer: { id: 'cust-1', firstName: 'Rafiq', lastName: 'Karim', email: 'rafiq.k@gmail.com', phone: '01711122233', loyaltyPoints: 120 },
    deviceId: 'dev-1',
    device: { id: 'dev-1', brand: 'Apple', model: 'iPhone 14 Pro', serialNumber: 'SN-IPH14P-9982', imei: '358992110294812' },
    assignedTechId: 'super-admin-uid-1111',
    assignedTech: { id: 'super-admin-uid-1111', email: 'admin@trustzone.care', firstName: 'System', lastName: 'Administrator', role: 'SUPER_ADMIN' },
    status: 'repairing',
    estimatedCost: 24500.00,
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    faults: ['Shattered screen digitizer'],
    tests: ['Screen: FAIL', 'Battery: PASS', 'Charging Port: PASS', 'Audio: PASS', 'Camera: PASS', 'Buttons: PASS'],
    diagnosisNotes: 'Front screen glass shattered. OLED digitizer panel bleeding ink. Touch completely unresponsive.',
    internalNotes: 'Replacing front screen display assembly with original BDT-grade screen part.',
    photos: [],
    partsRequired: ['SCRN-IPH14P'],
    customerApproved: true,
    diagnosticCompletedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    ticketHistory: [
      { id: 'h-4', ticketId: 'ticket-3', oldStatus: '', newStatus: 'booked', notes: 'Booking logged at Dhanmondi Desk.', createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
      { id: 'h-5', ticketId: 'ticket-3', oldStatus: 'booked', newStatus: 'diagnosing', notes: 'Technician System Administrator assigned.', createdAt: new Date(Date.now() - 44 * 3600 * 1000).toISOString() },
      { id: 'h-6', ticketId: 'ticket-3', oldStatus: 'diagnosing', newStatus: 'repairing', notes: 'Diagnostics completed. Estimate approved by customer. Parts allocated and repair process started.', createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString() }
    ]
  },
  {
    id: 'ticket-4',
    branchId: 'd1111111-1111-1111-1111-111111111111',
    customerId: 'cust-1',
    customer: { id: 'cust-1', firstName: 'Rafiq', lastName: 'Karim', email: 'rafiq.k@gmail.com', phone: '01711122233', loyaltyPoints: 120 },
    deviceId: 'dev-1',
    device: { id: 'dev-1', brand: 'Apple', model: 'iPhone 14 Pro', serialNumber: 'SN-IPH14P-9982', imei: '358992110294812' },
    assignedTechId: 'super-admin-uid-1111',
    assignedTech: { id: 'super-admin-uid-1111', email: 'admin@trustzone.care', firstName: 'System', lastName: 'Administrator', role: 'SUPER_ADMIN' },
    status: 'ready',
    estimatedCost: 6500.00,
    slaDeadline: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    faults: ['Back glass broken'],
    tests: ['Screen: PASS', 'Battery: PASS', 'Charging Port: PASS', 'Audio: PASS', 'Camera: PASS', 'Buttons: PASS'],
    diagnosisNotes: 'Rear back cover glass shattered. Internal components verified pristine and functional.',
    internalNotes: 'Back glass replaced using laser machine separator.',
    photos: [],
    partsRequired: ['GLASS-BACK-IPH14P'],
    customerApproved: true,
    diagnosticCompletedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    repairedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    ticketHistory: [
      { id: 'h-7', ticketId: 'ticket-4', oldStatus: '', newStatus: 'booked', notes: 'Ticket logged.', createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString() },
      { id: 'h-8', ticketId: 'ticket-4', oldStatus: 'booked', newStatus: 'diagnosing', notes: 'Assigned to System Administrator.', createdAt: new Date(Date.now() - 68 * 3600 * 1000).toISOString() },
      { id: 'h-9', ticketId: 'ticket-4', oldStatus: 'diagnosing', newStatus: 'repairing', notes: 'Laser separator run. Glass replaced.', createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString() },
      { id: 'h-10', ticketId: 'ticket-4', oldStatus: 'repairing', newStatus: 'ready', notes: 'Post-repair verification passed. Device ready for dispatch.', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
    ]
  }
];

function getMockTickets(): TicketModel[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_TICKETS;
  const stored = localStorage.getItem(MOCK_TICKETS_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_TICKETS_KEY, JSON.stringify(DEFAULT_MOCK_TICKETS));
    return DEFAULT_MOCK_TICKETS;
  }
  try {
    return JSON.parse(stored) as TicketModel[];
  } catch {
    return DEFAULT_MOCK_TICKETS;
  }
}

function saveMockTickets(tickets: TicketModel[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_TICKETS_KEY, JSON.stringify(tickets));
  }
}

// ----------------------------------------------------
// Core HTTP Request Handler
// ----------------------------------------------------
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...init } = options;

  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...init,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (!response.ok) {
      const errBody = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(errBody.message || `API request failed: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('BACKEND_OFFLINE'))) {
      throw new Error('BACKEND_OFFLINE');
    }
    throw error;
  }
}

// ----------------------------------------------------
// Centralized API Services Wrapper (With Local fallbacks)
// ----------------------------------------------------
export const api = {
  auth: {
    async login(fields: Record<string, unknown>): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
      try {
        return await apiRequest<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(fields),
        });
      } catch (err: unknown) {
        throw err;
      }
    },

    async adminLogin(fields: Record<string, unknown>): Promise<ApiResponse<AdminLoginData>> {
      try {
        return await apiRequest<ApiResponse<AdminLoginData>>('/auth/admin/login', {
          method: 'POST',
          body: JSON.stringify(fields),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          // Mock user registry — all seeded admin users
          interface MockAdminUser { id: string; email: string; firstName: string; lastName: string; role: string; permissions: string[]; branchId: string | null; }
          const MOCK_ADMIN_USERS: Record<string, { password: string; user: MockAdminUser }> = {
            'admin@trustzone.care': {
              password: 'Password123!',
              user: {
                id: 'super-admin-uid-1111',
                email: 'admin@trustzone.care',
                firstName: 'System',
                lastName: 'Administrator',
                role: 'SUPER_ADMIN',
                permissions: ['*'],
                branchId: 'd1111111-1111-1111-1111-111111111111',
              }
            },
            'branch.admin@trustzone.care': {
              password: 'AdminPass123!',
              user: {
                id: 'branch-admin-uid-2222',
                email: 'branch.admin@trustzone.care',
                firstName: 'Rafiq',
                lastName: 'Ahmed',
                role: 'ADMIN',
                permissions: [
                  'read:dashboard','read:repairs','write:repairs','read:bookings','write:bookings',
                  'read:customers','write:customers','read:technicians','write:technicians',
                  'read:inventory','write:inventory','read:suppliers','write:suppliers',
                  'read:invoices','write:invoices','read:warranty','write:warranty',
                  'read:reports','read:finance','read:marketing','read:crm',
                  'read:branches','write:branches','read:settings','write:settings',
                  'read:audit_logs','read:api','write:api','read:support'
                ],
                branchId: 'b2222222-2222-2222-2222-222222222222',
              }
            },
            'mirpur.manager@trustzone.care': {
              password: 'ManagerPass123!',
              user: {
                id: 'manager-uid-3333',
                email: 'mirpur.manager@trustzone.care',
                firstName: 'Nazma',
                lastName: 'Khatun',
                role: 'MANAGER',
                permissions: [
                  'read:dashboard','read:repairs','write:repairs','read:bookings','write:bookings',
                  'read:customers','write:customers','read:technicians',
                  'read:inventory','write:inventory','read:suppliers',
                  'read:invoices','write:invoices','read:warranty','write:warranty',
                  'read:reports','read:branches'
                ],
                branchId: 'c3333333-3333-3333-3333-333333333333',
              }
            },
          };

          const emailStr = fields.email as string;
          const passwordStr = fields.password as string;
          const mockUser = MOCK_ADMIN_USERS[emailStr];

          if (mockUser && mockUser.password === passwordStr) {
            addMockAuditLog('admin_login_success', { email: emailStr, browser: 'Chrome', device: 'Desktop PC', role: mockUser.user.role });
            return {
              success: true,
              data: {
                accessToken: `mock-admin-token-${mockUser.user.role.toLowerCase()}`,
                refreshToken: `mock-refresh-${mockUser.user.role.toLowerCase()}`,
                user: mockUser.user,
              }
            };
          } else {
            addMockAuditLog('admin_login_failed', { email: emailStr, reason: 'Invalid credentials' });
            throw new Error('Invalid credentials. Please check your email and password.');
          }
        }
        throw err;
      }
    },

    async logout(token: string, refreshToken: string): Promise<ApiResponse<unknown>> {
      try {
        return await apiRequest<ApiResponse<unknown>>('/auth/logout', {
          method: 'POST',
          token,
          body: JSON.stringify({ refreshToken }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          addMockAuditLog('logout_success');
          return { success: true, data: {} };
        }
        throw err;
      }
    },

    async logoutAll(token: string): Promise<ApiResponse<unknown>> {
      try {
        return await apiRequest<ApiResponse<unknown>>('/auth/admin/logout-all', {
          method: 'POST',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          addMockAuditLog('admin_logout_all_devices');
          return { success: true, data: {} };
        }
        throw err;
      }
    },

    async getLoginHistory(token: string): Promise<ApiResponse<AuditLogModel[]>> {
      try {
        return await apiRequest<ApiResponse<AuditLogModel[]>>('/auth/admin/login-history', {
          method: 'GET',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          return {
            success: true,
            data: getMockAuditLogs()
          };
        }
        throw err;
      }
    }
  },

  roles: {
    async list(token?: string): Promise<ApiResponse<RoleModel[]>> {
      try {
        return await apiRequest<ApiResponse<RoleModel[]>>('/roles', {
          method: 'GET',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          return {
            success: true,
            data: getMockRoles()
          };
        }
        throw err;
      }
    },

    async get(id: string, token?: string): Promise<ApiResponse<RoleModel>> {
      try {
        return await apiRequest<ApiResponse<RoleModel>>(`/roles/${id}`, {
          method: 'GET',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const role = getMockRoles().find((r) => r.id === id);
          if (!role) throw new Error('Role not found');
          return { success: true, data: role };
        }
        throw err;
      }
    },

    async create(data: { name: string; description?: string; permissions: string[] }, token?: string): Promise<ApiResponse<RoleModel>> {
      try {
        return await apiRequest<ApiResponse<RoleModel>>('/roles', {
          method: 'POST',
          token,
          body: JSON.stringify(data),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const roles = getMockRoles();
          const name = data.name.toUpperCase();
          if (roles.find((r) => r.name === name)) {
            throw new Error(`Role with name ${name} already exists.`);
          }
          const newRole: RoleModel = {
            id: `role-${Date.now()}`,
            name,
            description: data.description || '',
            permissions: data.permissions || [],
            isSystem: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          roles.push(newRole);
          saveMockRoles(roles);
          addMockAuditLog('role_create', { name, permissions: data.permissions });
          return { success: true, data: newRole };
        }
        throw err;
      }
    },

    async update(id: string, data: { description?: string; permissions?: string[] }, token?: string): Promise<ApiResponse<RoleModel>> {
      try {
        return await apiRequest<ApiResponse<RoleModel>>(`/roles/${id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify(data),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const roles = getMockRoles();
          const roleIdx = roles.findIndex((r) => r.id === id);
          if (roleIdx === -1) throw new Error('Role not found');

          // Keep SUPER_ADMIN override intact
          if (roles[roleIdx].name === 'SUPER_ADMIN') {
            data.permissions = ['*'];
          }

          roles[roleIdx] = {
            ...roles[roleIdx],
            description: data.description !== undefined ? data.description : roles[roleIdx].description,
            permissions: data.permissions !== undefined ? data.permissions : roles[roleIdx].permissions,
            updatedAt: new Date().toISOString()
          };
          saveMockRoles(roles);
          addMockAuditLog('permission_change', { role: roles[roleIdx].name, updatedPermissions: data.permissions });
          return { success: true, data: roles[roleIdx] };
        }
        throw err;
      }
    },

    async delete(id: string, token?: string): Promise<ApiResponse<unknown>> {
      try {
        return await apiRequest<ApiResponse<unknown>>(`/roles/${id}`, {
          method: 'DELETE',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const roles = getMockRoles();
          const role = roles.find((r) => r.id === id);
          if (!role) throw new Error('Role not found');
          if (role.isSystem) throw new Error('System-defined roles cannot be deleted.');

          const filtered = roles.filter((r) => r.id !== id);
          saveMockRoles(filtered);
          addMockAuditLog('role_delete', { name: role.name });
          return { success: true, data: {} };
        }
        throw err;
      }
    }
  },

  tickets: {
    async list(query?: { branchId?: string; status?: string; assignedTechId?: string; search?: string; page?: number; limit?: number }, token?: string): Promise<ApiResponse<TicketModel[]>> {
      try {
        let qStr = '';
        if (query) {
          const parts = [];
          if (query.branchId) parts.push(`branchId=${query.branchId}`);
          if (query.status) parts.push(`status=${query.status}`);
          if (query.assignedTechId) parts.push(`assignedTechId=${query.assignedTechId}`);
          if (query.search) parts.push(`search=${encodeURIComponent(query.search)}`);
          if (query.page) parts.push(`page=${query.page}`);
          if (query.limit) parts.push(`limit=${query.limit}`);
          if (parts.length > 0) qStr = '?' + parts.join('&');
        }
        return await apiRequest<ApiResponse<TicketModel[]>>(`/tickets${qStr}`, {
          method: 'GET',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          let tickets = getMockTickets();
          if (query) {
            if (query.branchId) tickets = tickets.filter(t => t.branchId === query.branchId);
            if (query.status) tickets = tickets.filter(t => t.status === query.status);
            if (query.assignedTechId) tickets = tickets.filter(t => t.assignedTechId === query.assignedTechId);
          }
          return { success: true, data: tickets };
        }
        throw err;
      }
    },

    async get(id: string, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}`, {
          method: 'GET',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const ticket = getMockTickets().find(t => t.id === id);
          if (!ticket) throw new Error('Ticket not found');
          return { success: true, data: ticket };
        }
        throw err;
      }
    },

    async create(
      data: {
        branchId: string;
        customerId?: string;
        customerFirstName?: string;
        customerLastName?: string;
        customerEmail?: string;
        customerPhone?: string;
        deviceId?: string;
        deviceBrand?: string;
        deviceModel?: string;
        deviceSerialNumber?: string;
        deviceImei?: string;
        slaDeadline: string;
        estimatedCost?: number;
        faults?: string[];
      },
      token?: string
    ): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>('/tickets', {
          method: 'POST',
          token,
          body: JSON.stringify(data),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const newId = `ticket-${Date.now()}`;
          const newTicket: TicketModel = {
            id: newId,
            branchId: data.branchId,
            customerId: data.customerId || `cust-${Date.now()}`,
            customer: data.customerId ? { id: data.customerId, firstName: 'Selected', lastName: 'Customer', email: 'selected@gmail.com', phone: '01700000000', loyaltyPoints: 0 } : { id: `cust-${Date.now()}`, firstName: data.customerFirstName || 'New', lastName: data.customerLastName || 'Customer', email: data.customerEmail || 'new@gmail.com', phone: data.customerPhone || '01700000000', loyaltyPoints: 0 },
            deviceId: data.deviceId || `dev-${Date.now()}`,
            device: data.deviceId ? { id: data.deviceId, brand: 'Selected', model: 'Device' } : { id: `dev-${Date.now()}`, brand: data.deviceBrand || 'Brand', model: data.deviceModel || 'Model', serialNumber: data.deviceSerialNumber, imei: data.deviceImei },
            status: 'booked',
            estimatedCost: data.estimatedCost || 0,
            slaDeadline: data.slaDeadline,
            faults: data.faults || [],
            tests: [],
            photos: [],
            partsRequired: [],
            customerApproved: false,
            createdAt: new Date().toISOString(),
            ticketHistory: [
              { id: `h-${Date.now()}`, ticketId: newId, oldStatus: '', newStatus: 'booked', notes: 'Ticket registered into workspace queue.', createdAt: new Date().toISOString() }
            ]
          };
          tickets.push(newTicket);
          saveMockTickets(tickets);
          addMockAuditLog('ticket_created', { ticketId: newId });
          return { success: true, data: newTicket };
        }
        throw err;
      }
    },

    async assign(id: string, assignedTechId: string | null, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/assign`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ assignedTechId }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx === -1) throw new Error('Ticket not found');
          
          let assignedTech = null;
          if (assignedTechId) {
            assignedTech = { id: assignedTechId, email: 'tech@trustzone.care', firstName: 'Assigned', lastName: 'Technician', role: 'TECHNICIAN' };
          }
          
          const oldStatus = tickets[ticketIdx].status;
          tickets[ticketIdx] = {
            ...tickets[ticketIdx],
            assignedTechId,
            assignedTech,
            ticketHistory: [
              ...(tickets[ticketIdx].ticketHistory || []),
              {
                id: `h-${Date.now()}`,
                ticketId: id,
                oldStatus,
                newStatus: oldStatus,
                notes: assignedTechId ? `Technician assigned to ticket.` : 'Technician unassigned from ticket.',
                createdAt: new Date().toISOString()
              }
            ]
          };
          saveMockTickets(tickets);
          addMockAuditLog('ticket_assignee_changed', { ticketId: id, assignedTechId });
          return { success: true, data: tickets[ticketIdx] };
        }
        throw err;
      }
    },

    async updateDiagnostics(
      id: string,
      data: {
        diagnosisNotes: string;
        internalNotes?: string;
        faults: string[];
        tests: string[];
        photos?: string[];
        partsRequired?: string[];
        estimatedCost: number;
        customerApproved?: boolean;
      },
      token?: string
    ): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/diagnostics`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(data),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx === -1) throw new Error('Ticket not found');
          
          const oldStatus = tickets[ticketIdx].status;
          const newStatus = oldStatus === 'booked' ? 'diagnosing' : oldStatus;
          
          tickets[ticketIdx] = {
            ...tickets[ticketIdx],
            status: newStatus,
            diagnosisNotes: data.diagnosisNotes,
            internalNotes: data.internalNotes,
            faults: data.faults,
            tests: data.tests,
            photos: data.photos || [],
            partsRequired: data.partsRequired || [],
            estimatedCost: data.estimatedCost,
            customerApproved: data.customerApproved ?? tickets[ticketIdx].customerApproved,
            diagnosticCompletedAt: new Date().toISOString(),
            ticketHistory: [
              ...(tickets[ticketIdx].ticketHistory || []),
              {
                id: `h-${Date.now()}`,
                ticketId: id,
                oldStatus,
                newStatus,
                notes: `Device diagnostics logged. Estimated Cost: ৳${data.estimatedCost}. Checklist and component testing completed.`,
                createdAt: new Date().toISOString()
              }
            ]
          };
          saveMockTickets(tickets);
          addMockAuditLog('ticket_diagnostics_logged', { ticketId: id });
          return { success: true, data: tickets[ticketIdx] };
        }
        throw err;
      }
    },

    async updateStatus(id: string, status: string, notes?: string, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/status`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ status, notes }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx === -1) throw new Error('Ticket not found');
          
          const oldStatus = tickets[ticketIdx].status;
          const extra: Partial<TicketModel> = {};
          if (status === 'ready') extra.repairedAt = new Date().toISOString();
          if (status === 'delivered') extra.deliveredAt = new Date().toISOString();
          
          tickets[ticketIdx] = {
            ...tickets[ticketIdx],
            status,
            ...extra,
            ticketHistory: [
              ...(tickets[ticketIdx].ticketHistory || []),
              {
                id: `h-${Date.now()}`,
                ticketId: id,
                oldStatus,
                newStatus: status,
                notes: notes || `Ticket status advanced to ${status}.`,
                createdAt: new Date().toISOString()
              }
            ]
          };
          saveMockTickets(tickets);
          addMockAuditLog('ticket_status_changed', { ticketId: id, status });
          return { success: true, data: tickets[ticketIdx] };
        }
        throw err;
      }
    },

    async approveEstimate(id: string, approved: boolean, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/approve`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ approved }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx === -1) throw new Error('Ticket not found');
          
          tickets[ticketIdx] = {
            ...tickets[ticketIdx],
            customerApproved: approved,
            ticketHistory: [
              ...(tickets[ticketIdx].ticketHistory || []),
              {
                id: `h-${Date.now()}`,
                ticketId: id,
                oldStatus: tickets[ticketIdx].status,
                newStatus: tickets[ticketIdx].status,
                notes: approved ? 'Customer approved the cost estimate. Proceeding with repairs.' : 'Cost estimate rejected / pending customer approval.',
                createdAt: new Date().toISOString()
              }
            ]
          };
          saveMockTickets(tickets);
          addMockAuditLog('ticket_estimate_approval_changed', { ticketId: id, approved });
          return { success: true, data: tickets[ticketIdx] };
        }
        throw err;
      }
    },

    async cancel(id: string, reason?: string, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/cancel`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ reason }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx !== -1) {
            tickets[ticketIdx].status = 'cancelled';
            saveMockTickets(tickets);
            return { success: true, data: tickets[ticketIdx] };
          }
        }
        throw err;
      }
    },

    async delete(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/tickets/${id}`, {
          method: 'DELETE',
          token,
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets().filter(t => t.id !== id);
          saveMockTickets(tickets);
          return { success: true, data: { id, message: 'Ticket removed' } };
        }
        throw err;
      }
    },

    async addNote(id: string, note: string, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/notes`, {
          method: 'POST',
          token,
          body: JSON.stringify({ note }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx !== -1) {
            const existing = tickets[ticketIdx].internalNotes || '';
            tickets[ticketIdx].internalNotes = existing ? `${existing}\n${note}` : note;
            saveMockTickets(tickets);
            return { success: true, data: tickets[ticketIdx] };
          }
        }
        throw err;
      }
    },

    async addSignature(id: string, signatureData: string, token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/signature`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ signatureData }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx !== -1) {
            return { success: true, data: tickets[ticketIdx] };
          }
        }
        throw err;
      }
    },

    async addPhotos(id: string, photos: string[], token?: string): Promise<ApiResponse<TicketModel>> {
      try {
        return await apiRequest<ApiResponse<TicketModel>>(`/tickets/${id}/photos`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ photos }),
        });
      } catch (err: unknown) {
        const errorObj = err as Error;
        if (errorObj.message === 'BACKEND_OFFLINE') {
          const tickets = getMockTickets();
          const ticketIdx = tickets.findIndex(t => t.id === id);
          if (ticketIdx !== -1) {
            tickets[ticketIdx].photos = Array.from(new Set([...(tickets[ticketIdx].photos || []), ...photos]));
            saveMockTickets(tickets);
            return { success: true, data: tickets[ticketIdx] };
          }
        }
        throw err;
      }
    },

    async dashboardStats(branchId?: string, token?: string): Promise<ApiResponse<any>> {
      const q = branchId ? `?branchId=${branchId}` : '';
      return apiRequest<ApiResponse<any>>(`/tickets/dashboard/stats${q}`, { token });
    },

    async consumeParts(id: string, parts: { partId: string; quantity: number }[], token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/tickets/${id}/consume-parts`, {
        method: 'POST',
        token,
        body: JSON.stringify({ parts }),
      });
    },

    async logTimeTrack(id: string, durationMinutes: number, notes?: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/tickets/${id}/time-log`, {
        method: 'POST',
        token,
        body: JSON.stringify({ durationMinutes, notes }),
      });
    },

    async sendNotify(id: string, recipientRole: string, channel: string, message: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/tickets/${id}/notify`, {
        method: 'POST',
        token,
        body: JSON.stringify({ recipientRole, channel, message }),
      });
    }
  },

  customers: {
    async list(params: { search?: string; tag?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      const q = new URLSearchParams();
      if (params.search) q.set('search', params.search);
      if (params.tag) q.set('tag', params.tag);
      if (params.branchId) q.set('branchId', params.branchId);
      return apiRequest<ApiResponse<any[]>>(`/customers?${q.toString()}`, { token });
    },
    async get(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}`, { token });
    },
    async create(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/customers', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async update(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data)
      });
    },
    async logComm(id: string, data: { type: string; message: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}/communications`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async uploadDoc(id: string, data: { fileName: string; fileUrl: string; fileSize: number }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}/documents`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async dashboardStats(branchId?: string, token?: string): Promise<ApiResponse<any>> {
      const q = branchId ? `?branchId=${branchId}` : '';
      return apiRequest<ApiResponse<any>>(`/customers/dashboard/stats${q}`, { token });
    },
    async delete(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}`, { method: 'DELETE', token });
    },
    async addDevice(id: string, data: { brand: string; model: string; serialNumber?: string; imei?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}/devices`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },
    async deleteDevice(id: string, deviceId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}/devices/${deviceId}`, {
        method: 'DELETE',
        token,
      });
    },
    async sendComm(id: string, data: { type: string; channel: string; message: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}/send-communication`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },
    async deleteDoc(id: string, docId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/customers/${id}/documents/${docId}`, {
        method: 'DELETE',
        token,
      });
    },
    async mergeDuplicates(primaryId: string, duplicateIds: string[], token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/customers/merge', {
        method: 'POST',
        token,
        body: JSON.stringify({ primaryId, duplicateIds }),
      });
    }
  },

  technicians: {
    async list(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      const q = params?.branchId ? `?branchId=${params.branchId}` : '';
      return apiRequest<ApiResponse<any[]>>(`/technicians${q}`, { token });
    },
    async get(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/technicians/${id}`, { token });
    },
    async update(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/technicians/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data)
      });
    },
    async logAttendance(id: string, data: { status: string; checkIn?: string; checkOut?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/technicians/${id}/attendance`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async submitLeave(id: string, data: { startDate: string; endDate: string; reason: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/technicians/${id}/leaves`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async approveLeave(leaveId: string, status: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/technicians/leaves/${leaveId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status })
      });
    }
  },

  inventory: {
    async dashboardStats(branchId?: string, token?: string): Promise<ApiResponse<any>> {
      const q = branchId ? `?branchId=${branchId}` : '';
      return apiRequest<ApiResponse<any>>(`/inventory/dashboard/stats${q}`, { token });
    },
    async updatePart(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/parts/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      });
    },
    async deletePart(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/parts/${id}`, {
        method: 'DELETE',
        token,
      });
    },
    async duplicatePart(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/parts/${id}/duplicate`, {
        method: 'POST',
        token,
      });
    },
    async parts(params: { search?: string; category?: string; brand?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      const q = new URLSearchParams();
      if (params.search) q.set('search', params.search);
      if (params.category) q.set('category', params.category);
      if (params.brand) q.set('brand', params.brand);
      if (params.branchId) q.set('branchId', params.branchId);
      return apiRequest<ApiResponse<any[]>>(`/inventory/parts?${q.toString()}`, { token });
    },
    async getPart(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/parts/${id}`, { token });
    },
    async createPart(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/inventory/parts', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async adjustStock(partId: string, data: { branchId: string; quantityDelta: number; type: string; notes?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/parts/${partId}/adjust`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async createTransfer(partId: string, data: { fromBranchId: string; toBranchId: string; quantity: number }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/parts/${partId}/transfer`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async executeTransfer(transferId: string, status: 'TRANSFERRED' | 'CANCELLED', token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/inventory/transfers/${transferId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status })
      });
    },
    async movements(token?: string): Promise<ApiResponse<any[]>> {
      return apiRequest<ApiResponse<any[]>>('/inventory/movements', { token });
    },
    async transfers(token?: string): Promise<ApiResponse<any[]>> {
      return apiRequest<ApiResponse<any[]>>('/inventory/transfers', { token });
    }
  },

  suppliers: {
    async list(token?: string): Promise<ApiResponse<any[]>> {
      return apiRequest<ApiResponse<any[]>>('/suppliers', { token });
    },
    async get(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/suppliers/${id}`, { token });
    },
    async create(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/suppliers', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async recordPayment(id: string, amount: number, reference?: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/suppliers/${id}/payment`, {
        method: 'POST',
        token,
        body: JSON.stringify({ amount, reference })
      });
    },
    async createPO(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/suppliers/orders', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },
    async listPOs(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      const q = params?.branchId ? `?branchId=${params.branchId}` : '';
      return apiRequest<ApiResponse<any[]>>(`/suppliers/orders${q}`, { token });
    },
    async getPO(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/suppliers/orders/${id}`, { token });
    },
    async updatePOStatus(id: string, status: 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED', receivedItems?: any[], token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/suppliers/orders/${id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status, receivedItems })
      });
    },
    async updatePOPayment(id: string, paymentStatus: 'unpaid' | 'partially_paid' | 'paid', token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/suppliers/orders/${id}/payment`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ paymentStatus })
      });
    }
  },

  invoices: {
    async dashboardStats(branchId?: string, token?: string): Promise<ApiResponse<any>> {
      const q = branchId ? `?branchId=${branchId}` : '';
      return apiRequest<ApiResponse<any>>(`/invoices/dashboard/stats${q}`, { token });
    },
    async list(params?: { search?: string; status?: string; branchId?: string; page?: number; limit?: number }, token?: string): Promise<ApiResponse<any>> {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.status) q.set('status', params.status);
      if (params?.branchId) q.set('branchId', params.branchId);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      return apiRequest<ApiResponse<any>>(`/invoices?${q.toString()}`, { token });
    },
    async get(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/invoices/${id}`, { token });
    },
    async create(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/invoices/create', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },
    async fromTicket(ticketId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/invoices/from-ticket/${ticketId}`, {
        method: 'POST',
        token,
      });
    },
    async recordPayment(id: string, data: { paymentMethod: string; amount: number; reference?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/invoices/${id}/payment`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },
    async processRefund(id: string, data: { amount: number; reason?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/invoices/${id}/refund`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },
  },

  finance: {
    async dashboard(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any>>(`/finance/dashboard${q}`, { token });
      } catch (err) {
        // Fallback Mock Dashboard
        const mockDashboard = {
          todayRevenue: 45000.00,
          todayExpenses: 12500.00,
          cashBalance: 125000.00,
          bankBalance: 1450000.00,
          mobileBankingBalance: 35000.00,
          accountsReceivable: 78500.00,
          accountsPayable: 35000.00,
          monthlyRevenue: 1350000.00,
          monthlyExpenses: 890000.00,
          grossProfit: 650000.00,
          netProfit: 460000.00,
          branchComparison: [
            { branchName: 'Dhanmondi Head Office', revenue: 650000, expense: 420000 },
            { branchName: 'Banani Laboratory', revenue: 450000, expense: 310000 },
            { branchName: 'Mirpur Express Desk', revenue: 250000, expense: 160000 }
          ],
          expenseCategories: [
            { category: 'Rent', amount: 150000 },
            { category: 'Salary', amount: 550000 },
            { category: 'Electricity', amount: 35000 },
            { category: 'Internet', amount: 12000 },
            { category: 'Marketing', amount: 45000 },
            { category: 'Miscellaneous', amount: 98000 }
          ],
          recentTransactions: [
            {
              id: 'tx-1',
              voucherNumber: 'JV-202607-449102',
              date: new Date().toISOString(),
              description: 'Invoice generated for Ticket ID: ticket-3',
              referenceModule: 'INVOICE',
              createdBy: { firstName: 'System', lastName: 'Administrator' },
              lines: [
                { account: { name: 'Accounts Receivable', accountNumber: '1200' }, debit: 24500, credit: 0 },
                { account: { name: 'Repair Service Income', accountNumber: '4010' }, debit: 0, credit: 24500 }
              ]
            },
            {
              id: 'tx-2',
              voucherNumber: 'JV-202607-119283',
              date: new Date().toISOString(),
              description: 'Customer payment received for Invoice INV-2026-9921',
              referenceModule: 'PAYMENT',
              createdBy: { firstName: 'System', lastName: 'Administrator' },
              lines: [
                { account: { name: 'Cash on Hand (Dhanmondi)', accountNumber: '1010-DHAN' }, debit: 24500, credit: 0 },
                { account: { name: 'Accounts Receivable', accountNumber: '1200' }, debit: 0, credit: 24500 }
              ]
            }
          ]
        };
        return { success: true, data: mockDashboard };
      }
    },

    async accounts(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/finance/accounts${q}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'acc-1', accountNumber: '1010-DHAN', name: 'Cash on Hand (Dhanmondi)', accountClass: 'ASSET', accountType: 'CASH', normalBalance: 'DEBIT', currentBalance: 50000.00, branchId: 'd1111111-1111-1111-1111-111111111111' },
            { id: 'acc-2', accountNumber: '1020-DHAN', name: 'City Bank A/C (Dhanmondi)', accountClass: 'ASSET', accountType: 'BANK', normalBalance: 'DEBIT', currentBalance: 500000.00, branchId: 'd1111111-1111-1111-1111-111111111111', bankName: 'City Bank Ltd.', accountNumberStr: '310992819001' },
            { id: 'acc-3', accountNumber: '1030-DHAN', name: 'bKash Merchant (Dhanmondi)', accountClass: 'ASSET', accountType: 'MOBILE_BANKING', normalBalance: 'DEBIT', currentBalance: 20000.00, branchId: 'd1111111-1111-1111-1111-111111111111', mobileNumber: '01711122233' },
            { id: 'acc-4', accountNumber: '1200', name: 'Accounts Receivable (Customer Dues)', accountClass: 'ASSET', accountType: 'RECEIVABLE', normalBalance: 'DEBIT', currentBalance: 78500.00 },
            { id: 'acc-5', accountNumber: '2100', name: 'Accounts Payable (Supplier Dues)', accountClass: 'LIABILITY', accountType: 'PAYABLE', normalBalance: 'CREDIT', currentBalance: 35000.00 },
            { id: 'acc-6', accountNumber: '1300', name: 'Inventory Asset', accountClass: 'ASSET', accountType: 'INVENTORY', normalBalance: 'DEBIT', currentBalance: 100000.00 },
            { id: 'acc-7', accountNumber: '4010', name: 'Repair Service Income', accountClass: 'INCOME', accountType: 'REVENUE', normalBalance: 'CREDIT', currentBalance: 0.00 }
          ]
        };
      }
    },

    async createAccount(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/accounts', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async transfer(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/accounts/transfer', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async adjust(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/accounts/adjust', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async periods(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/finance/periods', { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'p-1', name: '2026-07', startDate: '2026-07-01T00:00:00Z', endDate: '2026-07-31T23:59:59Z', isLocked: false, fiscalYear: { name: 'FY2026' } },
            { id: 'p-2', name: '2026-06', startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-30T23:59:59Z', isLocked: true, fiscalYear: { name: 'FY2026' } }
          ]
        };
      }
    },

    async fiscalYears(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/finance/fiscal-years', { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'fy-1', name: 'FY2026', startDate: '2026-01-01T00:00:00Z', endDate: '2026-12-31T23:59:59Z', status: 'ACTIVE' }
          ]
        };
      }
    },

    async createFiscalYear(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/fiscal-years', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async lockPeriod(id: string, isLocked: boolean, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/periods/${id}/lock`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ isLocked })
      });
    },

    async journals(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/finance/journals${q}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async reverseJournal(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/journals/${id}/reverse`, {
        method: 'POST',
        token
      });
    },

    async collectPayment(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/payments/customer', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async paySupplier(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/payments/supplier', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async expenses(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/finance/expenses${q}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'exp-1', category: 'Rent', amount: 150000.00, date: new Date().toISOString(), status: 'APPROVED', notes: 'Office space rent Dhanmondi', branch: { name: 'Dhanmondi Head Office' }, createdBy: { firstName: 'System', lastName: 'Administrator' } },
            { id: 'exp-2', category: 'Salary', amount: 25000.00, date: new Date().toISOString(), status: 'PENDING', notes: 'Technician salary Mirpur', branch: { name: 'Mirpur Express Desk' }, createdBy: { firstName: 'System', lastName: 'Administrator' } }
          ]
        };
      }
    },

    async createExpense(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/expenses', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async approveExpense(id: string, approved: boolean, accountId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/expenses/${id}/approve`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ approved, accountId })
      });
    },

    async incomes(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/finance/incomes${q}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async createIncome(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/incomes', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async dailyClosings(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/finance/daily-closing${q}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async executeDailyClosing(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/daily-closing', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async reportProfitLoss(params: { startDate: string, endDate: string, branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      const q = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
      if (params.branchId) q.set('branchId', params.branchId);
      return apiRequest<ApiResponse<any>>(`/finance/reports/profit-loss?${q.toString()}`, { token });
    },

    async reportCashBook(params: { startDate: string, endDate: string, branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      const q = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
      if (params.branchId) q.set('branchId', params.branchId);
      return apiRequest<ApiResponse<any>>(`/finance/reports/cash-book?${q.toString()}`, { token });
    },

    async reportBankBook(params: { startDate: string, endDate: string, branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      const q = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
      if (params.branchId) q.set('branchId', params.branchId);
      return apiRequest<ApiResponse<any>>(`/finance/reports/bank-book?${q.toString()}`, { token });
    },

    async reportCustomerDues(token?: string): Promise<ApiResponse<any[]>> {
      return apiRequest<ApiResponse<any[]>>('/finance/reports/customer-dues', { token });
    },

    async reportSupplierDues(token?: string): Promise<ApiResponse<any[]>> {
      return apiRequest<ApiResponse<any[]>>('/finance/reports/supplier-dues', { token });
    },

    async reportGeneralLedger(params: { startDate: string, endDate: string, accountId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      const q = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
      if (params.accountId) q.set('accountId', params.accountId);
      return apiRequest<ApiResponse<any[]>>(`/finance/reports/general-ledger?${q.toString()}`, { token });
    },

    async reportBalanceSheet(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      const q = params?.branchId ? `?branchId=${params.branchId}` : '';
      return apiRequest<ApiResponse<any>>(`/finance/reports/balance-sheet${q}`, { token });
    },

    async reportCashFlow(params: { startDate: string; endDate: string }, token?: string): Promise<ApiResponse<any>> {
      const q = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
      return apiRequest<ApiResponse<any>>(`/finance/reports/cash-flow?${q.toString()}`, { token });
    },

    async reconcile(data: { accountId: string; statementBalance: number; notes?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/finance/reconcile', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },

    async updateExpense(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/expenses/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      });
    },

    async deleteExpense(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/expenses/${id}`, {
        method: 'DELETE',
        token,
      });
    },

    async updateIncome(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/incomes/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      });
    },

    async deleteIncome(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/finance/incomes/${id}`, {
        method: 'DELETE',
        token,
      });
    },

    async reportTaxSummary(params: { startDate: string, endDate: string }, token?: string): Promise<ApiResponse<any>> {
      const q = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
      return apiRequest<ApiResponse<any>>(`/finance/reports/tax-summary?${q.toString()}`, { token });
    }
  },
  
  crm: {
    async fetchDashboardStats(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/crm/dashboard/stats', { token });
      } catch (err) {
        return {
          success: true,
          data: {
            totalCustomers: 120,
            activeLoyaltyMembers: 84,
            totalPointsIssued: 12500,
            totalPointsRedeemed: 4200,
            totalExpiredPoints: 850,
            surveyResponseRate: 78,
            npsScore: 84,
            npsAverage: 9.1,
            promotersPercent: 88,
            passivesPercent: 8,
            detractorsPercent: 4,
            communicationActivity: [
              { channel: 'Email', count: 412 },
              { channel: 'SMS', count: 184 },
              { channel: 'WhatsApp', count: 96 }
            ],
            customerGrowth: [
              { month: 'Feb 26', count: 10 },
              { month: 'Mar 26', count: 18 },
              { month: 'Apr 26', count: 22 },
              { month: 'May 26', count: 30 },
              { month: 'Jun 26', count: 40 }
            ],
            topVipCustomers: [
              { id: 'c-1', name: 'Zahid Hasan', email: 'zahid@gmail.com', phone: '01711223344', loyaltyPoints: 2450 },
              { id: 'c-2', name: 'Maria Rahman', email: 'maria@gmail.com', phone: '01899887766', loyaltyPoints: 1850 },
              { id: 'c-3', name: 'Tanvir Chowdhury', email: 'tanvir@gmail.com', phone: '01911223344', loyaltyPoints: 1200 }
            ],
            customersRequiringFollowUp: [
              { feedbackId: 'fb-1', customerId: 'cust-1', customerName: 'Imran Khan', phone: '01711223344', npsScore: 4, comments: 'Device repair took 5 days instead of 2. No parts in stock.', ticketId: 't-1', date: new Date().toISOString() }
            ]
          }
        };
      }
    },

    async fetchLoyaltyTransactions(params?: { customerId?: string, search?: string, type?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.customerId) q.set('customerId', params.customerId);
        if (params?.search) q.set('search', params.search);
        if (params?.type) q.set('type', params.type);
        return await apiRequest<ApiResponse<any[]>>(`/crm/loyalty/transactions?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'lt-1', pointsDelta: 50, type: 'EARNED', description: 'Points earned on Invoice payment', createdAt: new Date().toISOString(), customer: { firstName: 'Zahid', lastName: 'Hasan', email: 'zahid@gmail.com' } },
            { id: 'lt-2', pointsDelta: -20, type: 'REDEEMED', description: 'Points redeemed for repair discount', createdAt: new Date().toISOString(), customer: { firstName: 'Maria', lastName: 'Rahman', email: 'maria@gmail.com' } },
            { id: 'lt-3', pointsDelta: 10, type: 'ADJUSTED', description: 'Goodwill gesture credit', createdAt: new Date().toISOString(), customer: { firstName: 'Tanvir', lastName: 'Chowdhury', email: 'tanvir@gmail.com' } }
          ]
        };
      }
    },

    async adjustLoyaltyPoints(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/loyalty/adjust', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async redeemLoyaltyPoints(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/loyalty/redeem', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async expireLoyaltyPoints(expiryDays: number, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/loyalty/expire', {
        method: 'POST',
        token,
        body: JSON.stringify({ expiryDays })
      });
    },

    async fetchCommunications(params?: { search?: string, type?: string, status?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.type) q.set('type', params.type);
        if (params?.status) q.set('status', params.status);
        return await apiRequest<ApiResponse<any[]>>(`/crm/communications?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'com-1', type: 'Email', subject: 'Device Ready Alert', message: 'Your phone has been repaired and passes QA', status: 'Delivered', staffName: 'Nazmul Tech', createdAt: new Date().toISOString(), customer: { firstName: 'Zahid', lastName: 'Hasan', email: 'zahid@gmail.com', phone: '01711223344' } },
            { id: 'com-2', type: 'SMS', message: 'NPS survey link: http://trustzone.care/survey/123', status: 'Sent', staffName: 'System Scheduler', createdAt: new Date().toISOString(), customer: { firstName: 'Imran', lastName: 'Khan', email: 'imran@gmail.com', phone: '01711223344' } }
          ]
        };
      }
    },

    async logCommunication(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/communications', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async fetchFeedback(params?: { search?: string, status?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.status) q.set('status', params.status);
        return await apiRequest<ApiResponse<any[]>>(`/crm/feedback?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'fb-1', rating: 5, npsScore: 10, comments: 'Extremely fast screen replacement. Highly recommended!', wouldRecommend: 'Yes', followUpRequired: false, resolutionStatus: 'PENDING', status: 'COMPLETED', createdAt: new Date().toISOString(), customer: { firstName: 'Zahid', lastName: 'Hasan', email: 'zahid@gmail.com' }, ticket: { id: 't-1' } },
            { id: 'fb-2', rating: 2, npsScore: 4, comments: 'Device repair took 5 days instead of 2. No parts in stock.', wouldRecommend: 'No', followUpRequired: true, resolutionStatus: 'PENDING', status: 'COMPLETED', createdAt: new Date().toISOString(), customer: { firstName: 'Imran', lastName: 'Khan', email: 'imran@gmail.com' }, ticket: { id: 't-2' } }
          ]
        };
      }
    },

    async fetchNpsSummary(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/crm/feedback/nps', { token });
      } catch (err) {
        return {
          success: true,
          data: {
            averageNps: 8.8,
            promoters: 15,
            passives: 3,
            detractors: 2,
            promotersPercent: 75,
            passivesPercent: 15,
            detractorsPercent: 10,
            npsScore: 65,
            responseRate: 85,
            trend: [
              { month: 'Feb 26', score: 50, count: 4 },
              { month: 'Mar 26', score: 60, count: 6 },
              { month: 'Apr 26', score: 65, count: 8 },
              { month: 'May 26', score: 70, count: 12 },
              { month: 'Jun 26', score: 65, count: 20 }
            ]
          }
        };
      }
    },

    async submitFeedback(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/crm/feedback/${id}`, {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });
    },

    async triggerManualSurvey(ticketId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/feedback/trigger-manual', {
        method: 'POST',
        token,
        body: JSON.stringify({ ticketId })
      });
    },

    async fetchCustomerTimeline(customerId: string, params?: { type?: string, startDate?: string, endDate?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.type) q.set('type', params.type);
        if (params?.startDate) q.set('startDate', params.startDate);
        if (params?.endDate) q.set('endDate', params.endDate);
        return await apiRequest<ApiResponse<any[]>>(`/crm/customers/${customerId}/timeline?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'act-1', type: 'CUSTOMER_CREATED', title: 'Customer Profile Created', description: 'Customer profile registered in platform database.', createdAt: new Date().toISOString() },
            { id: 'act-2', type: 'TICKET_CREATED', title: 'Repair Ticket Created', description: 'iPhone 13 screen replacement ticket generated.', createdAt: new Date().toISOString() },
            { id: 'act-3', type: 'LOYALTY_EARNED', title: 'Loyalty Points Earned', description: 'Earned 45 points on payment of ৳4500.', createdAt: new Date().toISOString() }
          ]
        };
      }
    },

    async fetchNotes(customerId: string, category?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = category ? `?category=${category}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/crm/customers/${customerId}/notes${q}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async createNote(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/notes', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },

    async updateNote(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/crm/notes/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      });
    },

    async deleteNote(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/crm/notes/${id}`, {
        method: 'DELETE',
        token,
      });
    },

    async fetchFollowUps(params?: { customerId?: string; status?: string; priority?: string; channel?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.customerId) q.set('customerId', params.customerId);
        if (params?.status) q.set('status', params.status);
        if (params?.priority) q.set('priority', params.priority);
        if (params?.channel) q.set('channel', params.channel);
        return await apiRequest<ApiResponse<any[]>>(`/crm/followups?${q.toString()}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async createFollowUp(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/followups', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },

    async updateFollowUp(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/crm/followups/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      });
    },

    async completeFollowUp(id: string, completionNotes?: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/crm/followups/${id}/complete`, {
        method: 'POST',
        token,
        body: JSON.stringify({ completionNotes }),
      });
    },

    async fetchRewards(activeOnly?: boolean, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = activeOnly ? '?activeOnly=true' : '';
        return await apiRequest<ApiResponse<any[]>>(`/crm/rewards${q}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async issueReward(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/rewards/issue', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      });
    },

    async validateReward(code: string, customerId?: string, orderValue?: number, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/rewards/validate', {
        method: 'POST',
        token,
        body: JSON.stringify({ code, customerId, orderValue }),
      });
    },

    async triggerReminders(token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/crm/reminders/trigger', {
        method: 'POST',
        token,
      });
    },

    async fetchSegmentedCustomers(params?: { segment?: string; search?: string; tag?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.segment) q.set('segment', params.segment);
        if (params?.search) q.set('search', params.search);
        if (params?.tag) q.set('tag', params.tag);
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any[]>>(`/crm/customers/segmented?${q.toString()}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async fetchReports(type: string, dateRange?: string, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = new URLSearchParams({ type });
        if (dateRange) q.set('dateRange', dateRange);
        return await apiRequest<ApiResponse<any>>(`/crm/reports?${q.toString()}`, { token });
      } catch (err) {
        return { success: true, data: null };
      }
    }
  },

  analytics: {
    async fetchDashboard(params?: { dateRange?: string; customStart?: string; customEnd?: string; branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = new URLSearchParams();
        if (params?.dateRange) q.set('dateRange', params.dateRange);
        if (params?.customStart) q.set('customStart', params.customStart);
        if (params?.customEnd) q.set('customEnd', params.customEnd);
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any>>(`/analytics/dashboard?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: {
            revenue: { currentMonth: 450000, previousMonth: 380000, growthRate: 18.4, totalYearToDate: 4250000 },
            repairs: { total: 142, completed: 118, pending: 18, cancelled: 6, avgTurnaroundHours: 4.5, warrantyClaims: 8 },
            inventory: { totalValuation: 1250000, activeSkus: 85, lowStockAlerts: 4, outOfStockCount: 2 },
            customers: { totalActive: 540, newThisMonth: 64, vipCount: 42, avgLifetimeValue: 14500 },
            technicians: { activeTechs: 12, topPerformer: 'Rahim Tech (Mirpur)', avgRating: 4.8 },
            branches: [
              { id: 'b-1', name: 'Dhanmondi Head Office', revenue: 210000, repairsCount: 65, rating: 4.9 },
              { id: 'b-2', name: 'Banani Laboratory', revenue: 145000, repairsCount: 48, rating: 4.7 },
              { id: 'b-3', name: 'Mirpur Express Desk', revenue: 95000, repairsCount: 29, rating: 4.8 }
            ]
          }
        };
      }
    },

    async fetchLeaderboard(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/analytics/leaderboard${q}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'tech-1', name: 'Rahim Tech', jobsCompleted: 42, avgTimeHours: 2.1, revenueGenerated: 185000, rating: 4.9, branchName: 'Dhanmondi' },
            { id: 'tech-2', name: 'Karim Senior Tech', jobsCompleted: 38, avgTimeHours: 2.8, revenueGenerated: 154000, rating: 4.8, branchName: 'Banani' },
            { id: 'tech-3', name: 'Sumon Tech', jobsCompleted: 29, avgTimeHours: 3.2, revenueGenerated: 112000, rating: 4.7, branchName: 'Mirpur' }
          ]
        };
      }
    },

    async fetchInventoryIntelligence(params?: { branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = params?.branchId ? `?branchId=${params.branchId}` : '';
        return await apiRequest<ApiResponse<any>>(`/analytics/inventory-intelligence${q}`, { token });
      } catch (err) {
        return {
          success: true,
          data: {
            fastMoving: [
              { sku: 'P-IP13-OLED', name: 'iPhone 13 OLED Display', monthlyUsage: 45, turnoverDays: 6 },
              { sku: 'P-SAM-S22-BAT', name: 'Samsung S22 Battery', monthlyUsage: 38, turnoverDays: 8 }
            ],
            slowMoving: [
              { sku: 'P-ONE-7T-CAM', name: 'OnePlus 7T Rear Camera Module', monthlyUsage: 1, turnoverDays: 140 }
            ],
            stockValuationTotal: 1250000
          }
        };
      }
    },

    async fetchForecast(type: string, params?: { branchId?: string }, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = new URLSearchParams({ type });
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any>>(`/analytics/forecast?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: {
            forecastType: type,
            projectedNextMonth: 520000,
            confidenceScore: 92.5,
            trend: 'UPWARD',
            datapoints: [
              { label: 'Current', value: 450000 },
              { label: 'Next Month (Projected)', value: 520000 },
              { label: 'Month +2 (Projected)', value: 580000 }
            ]
          }
        };
      }
    },

    async fetchReports(reportType: string, params?: { dateRange?: string; customStart?: string; customEnd?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams({ reportType });
        if (params?.dateRange) q.set('dateRange', params.dateRange);
        if (params?.customStart) q.set('customStart', params.customStart);
        if (params?.customEnd) q.set('customEnd', params.customEnd);
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any[]>>(`/analytics/reports?${q.toString()}`, { token });
      } catch (err) {
        return {
          success: true,
          data: [
            { id: 'rep-1', reference: 'REP-1092', date: new Date().toISOString(), category: 'Repair', amount: 14500, status: 'Completed', customerName: 'Zahid Hasan', branchName: 'Dhanmondi' },
            { id: 'rep-2', reference: 'REP-1093', date: new Date().toISOString(), category: 'Parts Sale', amount: 3500, status: 'Completed', customerName: 'Maria Rahman', branchName: 'Banani' }
          ]
        };
      }
    },

    async fetchDrillDown(type: string, params?: { dateRange?: string; customStart?: string; customEnd?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams({ type });
        if (params?.dateRange) q.set('dateRange', params.dateRange);
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any[]>>(`/analytics/drilldown?${q.toString()}`, { token });
      } catch (err) {
        return { success: true, data: [] };
      }
    },

    async fetchDrilldown(type: string, params?: { dateRange?: string; customStart?: string; customEnd?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      return this.fetchDrillDown(type, params, token);
    },

    async logExport(exportType: string, reportName: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/analytics/log-export', {
        method: 'POST',
        token,
        body: JSON.stringify({ exportType, reportName })
      });
    }
  },

  warranty: {
    async verify(warrantyNumber: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/warranty/verify/${warrantyNumber}`);
      } catch (err) {
        const mockWarrs = getMockWarranties();
        const found = mockWarrs.find(
          (w: any) => w.warrantyNumber.toLowerCase() === warrantyNumber.toLowerCase() ||
               w.serialOrImei.toLowerCase() === warrantyNumber.toLowerCase()
        );
        if (found) return { success: true, data: found };
        throw new Error('Warranty certificate not found');
      }
    },

    async list(params?: { search?: string; status?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.status) q.set('status', params.status);
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any[]>>(`/warranty?${q.toString()}`, { token });
      } catch (err) {
        let list = getMockWarranties();
        if (params?.status) list = list.filter((w: any) => w.status === params.status);
        if (params?.branchId) list = list.filter((w: any) => w.branchId === params.branchId);
        if (params?.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (w: any) => w.warrantyNumber.toLowerCase().includes(s) ||
                 w.serialOrImei.toLowerCase().includes(s) ||
                 w.customer.firstName.toLowerCase().includes(s) ||
                 w.customer.lastName.toLowerCase().includes(s) ||
                 w.customer.phone.includes(s)
          );
        }
        return { success: true, data: list };
      }
    },

    async create(data: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/warranty/create', {
          method: 'POST',
          token,
          body: JSON.stringify(data)
        });
      } catch (err) {
        const list = getMockWarranties();
        const seq = Math.floor(100000 + Math.random() * 900000);
        const newWarr = {
          id: `w-${seq}`,
          customerId: data.customerId,
          customer: { firstName: 'Manual', lastName: 'Customer', phone: '01711223344', email: 'manual@test.com' },
          branchId: data.branchId,
          branch: { name: 'Downtown Branch' },
          warrantyNumber: `TZ-WARR-${seq}`,
          warrantyType: data.warrantyType,
          deviceBrand: data.deviceBrand,
          deviceModel: data.deviceModel,
          serialOrImei: data.serialOrImei,
          durationMonths: data.durationMonths || 12,
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + (data.durationMonths || 12))).toISOString(),
          status: 'ACTIVE',
          coverageDetails: data.coverageDetails || ['Hardware fault'],
          exclusions: data.exclusions || ['Physical damage'],
          terms: data.terms || 'Standard terms apply.',
          claims: [],
          history: [{ action: 'ISSUED', notes: 'Manual certificate issued.', createdAt: new Date().toISOString() }],
          createdAt: new Date().toISOString()
        };
        list.unshift(newWarr);
        saveMockWarranties(list);
        return { success: true, data: newWarr };
      }
    },

    async void(id: string, reason: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/warranty/${id}/void`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ reason })
        });
      } catch (err) {
        const list = getMockWarranties();
        const found = list.find((w: any) => w.id === id);
        if (found) {
          found.status = 'VOID';
          found.voidReason = reason;
          found.history.push({ action: 'VOIDED', notes: `Voided: ${reason}`, createdAt: new Date().toISOString() });
          saveMockWarranties(list);
          return { success: true, data: found };
        }
        throw new Error('Warranty not found');
      }
    },

    async listClaims(params?: { status?: string; branchId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.status) q.set('status', params.status);
        if (params?.branchId) q.set('branchId', params.branchId);
        return await apiRequest<ApiResponse<any[]>>(`/warranty/claims?${q.toString()}`, { token });
      } catch (err) {
        let list = getMockClaims();
        if (params?.status) list = list.filter((c: any) => c.status === params.status);
        if (params?.branchId) list = list.filter((c: any) => c.branchId === params.branchId);
        return { success: true, data: list };
      }
    },

    async createClaim(data: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/warranty/claims/create', {
          method: 'POST',
          token,
          body: JSON.stringify(data)
        });
      } catch (err) {
        const list = getMockClaims();
        const seq = Math.floor(100000 + Math.random() * 900000);
        const warrList = getMockWarranties();
        const warr = warrList.find((w: any) => w.id === data.warrantyId);
        if (warr) {
          warr.status = 'CLAIMED';
          warr.history.push({ action: 'CLAIMED', notes: `Claim filed TZ-CLM-${seq}`, createdAt: new Date().toISOString() });
          saveMockWarranties(warrList);
        }

        const newClaim = {
          id: `c-${seq}`,
          warrantyId: data.warrantyId,
          warranty: warr || { warrantyNumber: 'TZ-WARR-MOCK', customer: { firstName: 'Mock', lastName: 'User' } },
          claimNumber: `TZ-CLM-${seq}`,
          issueDescription: data.issueDescription,
          status: 'PENDING',
          notes: data.notes || '',
          branchId: data.branchId,
          branch: { name: 'Downtown Branch' },
          isCovered: false,
          estimatedCost: 0,
          inspectionNotes: '',
          inspectionDiagnosis: '',
          attachments: data.attachments || [],
          inspectionPhotos: [],
          createdAt: new Date().toISOString()
        };
        list.unshift(newClaim);
        saveMockClaims(list);
        return { success: true, data: newClaim };
      }
    },

    async submitInspection(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/warranty/claims/${id}/inspection`, {
          method: 'POST',
          token,
          body: JSON.stringify(data)
        });
      } catch (err) {
        const list = getMockClaims();
        const found = list.find((c: any) => c.id === id);
        if (found) {
          Object.assign(found, {
            status: 'INSPECTION',
            inspectionNotes: data.inspectionNotes,
            inspectionDiagnosis: data.inspectionDiagnosis,
            isCovered: data.isCovered,
            estimatedCost: data.estimatedCost || 0,
            inspectionPhotos: data.inspectionPhotos || [],
            oldPartId: data.oldPartId || null,
            newPartId: data.newPartId || null,
            replacementSerialNumber: data.replacementSerialNumber || null,
            replacementCost: data.replacementCost || 0,
          });
          saveMockClaims(list);
          return { success: true, data: found };
        }
        throw new Error('Claim not found');
      }
    },

    async updateClaimStatus(id: string, status: string, resolutionDetails?: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/warranty/claims/${id}/status`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ status, resolutionDetails })
        });
      } catch (err) {
        const list = getMockClaims();
        const found = list.find((c: any) => c.id === id);
        if (found) {
          found.status = status;
          found.resolutionDetails = resolutionDetails || '';
          
          const warrList = getMockWarranties();
          const warr = warrList.find((w: any) => w.id === found.warrantyId);
          if (warr) {
            if (status === 'APPROVED') {
              warr.status = 'REPLACED';
              warr.history.push({ action: 'APPROVED', notes: `Claim approved: ${resolutionDetails}`, createdAt: new Date().toISOString() });
            } else if (status === 'REJECTED') {
              warr.status = 'ACTIVE';
              warr.history.push({ action: 'REJECTED', notes: `Claim rejected: ${resolutionDetails}`, createdAt: new Date().toISOString() });
            } else if (status === 'DELIVERED') {
              warr.status = 'PARTIALLY_USED';
              warr.history.push({ action: 'DELIVERED', notes: 'Replacement delivered.', createdAt: new Date().toISOString() });
            }
            saveMockWarranties(warrList);
          }
          saveMockClaims(list);
          return { success: true, data: found };
        }
        throw new Error('Claim not found');
      }
    },

    async listRmas(params?: { status?: string; supplierId?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (params?.status) q.set('status', params.status);
        if (params?.supplierId) q.set('supplierId', params.supplierId);
        return await apiRequest<ApiResponse<any[]>>(`/warranty/rmas?${q.toString()}`, { token });
      } catch (err) {
        let list = getMockRmas();
        if (params?.status) list = list.filter((r: any) => r.status === params.status);
        if (params?.supplierId) list = list.filter((r: any) => r.supplierId === params.supplierId);
        return { success: true, data: list };
      }
    },

    async createRma(data: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/warranty/rmas/create', {
          method: 'POST',
          token,
          body: JSON.stringify(data)
        });
      } catch (err) {
        const list = getMockRmas();
        const seq = Math.floor(100000 + Math.random() * 900000);
        const newRma = {
          id: `r-${seq}`,
          rmaNumber: `TZ-RMA-${seq}`,
          partId: data.partId,
          part: { name: 'iPhone 13 OLED Assembly', basePrice: 4200 },
          supplierId: data.supplierId,
          supplier: { name: 'M/S Tech Suppliers' },
          branchId: data.branchId,
          branch: { name: 'Downtown Branch' },
          quantity: data.quantity || 1,
          reason: data.reason,
          status: 'PENDING',
          courier: data.courier || '',
          trackingNumber: data.trackingNumber || '',
          vendorReference: data.vendorReference || '',
          replacementEta: data.replacementEta || null,
          notes: data.notes || '',
          createdAt: new Date().toISOString()
        };
        list.unshift(newRma);
        saveMockRmas(list);
        return { success: true, data: newRma };
      }
    },

    async updateRmaStatus(id: string, status: string, notes?: string, creditNoteNumber?: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/warranty/rmas/${id}/status`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ status, notes, creditNoteNumber })
        });
      } catch (err) {
        const list = getMockRmas();
        const found = list.find((r: any) => r.id === id);
        if (found) {
          found.status = status;
          if (notes) found.notes = notes;
          if (creditNoteNumber) found.creditNoteNumber = creditNoteNumber;
          if (status === 'CREDITED' || status === 'REPLACED') {
            found.receivedDate = new Date().toISOString();
          }
          saveMockRmas(list);
          return { success: true, data: found };
        }
        throw new Error('RMA return not found');
      }
    },

    async fetchDashboardStats(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/warranty/dashboard/stats', { token });
      } catch (err) {
        const mockWarrs = getMockWarranties();
        const mockClaims = getMockClaims();
        const mockRmas = getMockRmas();

        const activeWarranties = mockWarrs.filter((w: any) => w.status === 'ACTIVE').length;
        const expiredWarranties = mockWarrs.filter((w: any) => w.status === 'EXPIRED').length;
        const voidedWarranties = mockWarrs.filter((w: any) => w.status === 'VOID').length;

        const pendingClaims = mockClaims.filter((c: any) => c.status === 'PENDING').length;
        const inspectionClaims = mockClaims.filter((c: any) => c.status === 'INSPECTION').length;
        const approvedClaims = mockClaims.filter((c: any) => c.status === 'APPROVED').length;
        const rejectedClaims = mockClaims.filter((c: any) => c.status === 'REJECTED').length;

        const activeRmas = mockRmas.filter((r: any) => ['PENDING', 'SHIPPED'].includes(r.status)).length;

        return {
          success: true,
          data: {
            activeWarranties,
            expiredWarranties,
            voidedWarranties,
            pendingClaims,
            inspectionClaims,
            approvedClaims,
            rejectedClaims,
            activeRmas,
            monthlyClaimsTrends: [
              { month: 'Feb 26', count: 4 },
              { month: 'Mar 26', count: 7 },
              { month: 'Apr 26', count: 12 },
              { month: 'May 26', count: 15 },
              { month: 'Jun 26', count: 9 }
            ]
          }
        };
      }
    },

    async fetchReports(type: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/warranty/reports?type=${type}`, { token });
      } catch (err) {
        if (type === 'warranty') return { success: true, data: getMockWarranties() };
        if (type === 'claims') return { success: true, data: getMockClaims() };
        if (type === 'supplier-rma') return { success: true, data: getMockRmas() };
        if (type === 'failure-analysis') {
          return {
            success: true,
            data: [
              { deviceBrand: 'Apple', claimsCount: 14 },
              { deviceBrand: 'Samsung', claimsCount: 9 },
              { deviceBrand: 'Xiaomi', claimsCount: 5 }
            ]
          };
        }
        return { success: true, data: [] };
      }
    }
  },

  automation: {
    async fetchRules(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/automation/rules', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_rules');
        if (!stored) {
          const defaults = [
            { id: 'rule-1', name: 'Delivered Ticket Warranty', triggerEvent: 'TICKET_DELIVERED', conditions: { logicalOperator: 'AND', conditions: [] }, actions: [{ type: 'GENERATE_WARRANTY' }], priority: 'HIGH', enabled: true },
            { id: 'rule-2', name: 'Low Stock Manager Alert', triggerEvent: 'STOCK_BELOW_THRESHOLD', conditions: { logicalOperator: 'AND', conditions: [] }, actions: [{ type: 'SEND_NOTIFICATION', params: { channel: 'IN_APP', priority: 'HIGH', title: 'Low Stock Alert', message: 'Part is below threshold' } }], priority: 'HIGH', enabled: true },
            { id: 'rule-3', name: 'Invoice Overdue Reminder', triggerEvent: 'INVOICE_OVERDUE', conditions: { logicalOperator: 'AND', conditions: [] }, actions: [{ type: 'SEND_NOTIFICATION', params: { channel: 'EMAIL', priority: 'MEDIUM', title: 'Invoice Unpaid Reminder', message: 'Invoice {{invoice}} remains unpaid' } }], priority: 'MEDIUM', enabled: true }
          ];
          localStorage.setItem('tz_mock_rules', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createRule(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/automation/rules', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const rules = JSON.parse(localStorage.getItem('tz_mock_rules') || '[]');
        const newRule = { id: `rule-${Date.now()}`, ...body, enabled: true, createdAt: new Date().toISOString() };
        rules.push(newRule);
        localStorage.setItem('tz_mock_rules', JSON.stringify(rules));
        return { success: true, data: newRule };
      }
    },
    async updateRule(id: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/automation/rules/${id}`, { method: 'PUT', body: JSON.stringify(body), token });
      } catch {
        const rules = JSON.parse(localStorage.getItem('tz_mock_rules') || '[]');
        const idx = rules.findIndex((r: any) => r.id === id);
        if (idx !== -1) {
          rules[idx] = { ...rules[idx], ...body };
          localStorage.setItem('tz_mock_rules', JSON.stringify(rules));
          return { success: true, data: rules[idx] };
        }
        return { success: false, data: null };
      }
    },
    async deleteRule(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/automation/rules/${id}`, { method: 'DELETE', token });
      } catch {
        const rules = JSON.parse(localStorage.getItem('tz_mock_rules') || '[]');
        const filtered = rules.filter((r: any) => r.id !== id);
        localStorage.setItem('tz_mock_rules', JSON.stringify(filtered));
        return { success: true, data: null };
      }
    },
    async simulateRule(id: string, contextObj: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/automation/rules/${id}/simulate`, { method: 'POST', body: JSON.stringify(contextObj), token });
      } catch {
        return { success: true, data: { matchResult: true, potentialActions: [{ type: 'SEND_NOTIFICATION' }] } };
      }
    },
    async fetchExecutions(ruleId?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = ruleId ? `?ruleId=${ruleId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/automation/executions${q}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'exec-1', rule: { name: 'Low Stock Manager Alert' }, status: 'SUCCESS', retryCount: 0, createdAt: new Date().toISOString(), logs: [{ message: 'Evaluated rule successfully', level: 'INFO' }] }
          ]
        };
      }
    },
    async retryExecution(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/automation/executions/${id}/retry`, { method: 'POST', token });
      } catch {
        return { success: true, data: null };
      }
    },
    async fetchWebhookLogs(ruleId?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = ruleId ? `?ruleId=${ruleId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/automation/webhooks/logs${q}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'web-1', rule: { name: 'Zapier Lead Broadcast' }, url: 'https://hooks.zapier.com/hooks/catch/123/abc', method: 'POST', responseStatus: 200, status: 'SUCCESS', createdAt: new Date().toISOString() }
          ]
        };
      }
    },
    async fetchTemplates(type?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = type ? `?type=${type}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/notifications/templates${q}`, { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_templates');
        if (!stored) {
          const defaults = [
            { id: 'temp-1', name: 'Email Invoice Due', type: 'EMAIL', subject: 'Invoice Payment Due', content: 'Dear {{customer}}, your invoice {{invoice}} for ৳{{amount}} is ready.', variables: ['customer', 'invoice', 'amount'] },
            { id: 'temp-2', name: 'SMS Delivery Status', type: 'SMS', content: 'TZ Care: Ticket {{ticket}} is ready for pickup in {{branch}}.', variables: ['ticket', 'branch'] }
          ];
          localStorage.setItem('tz_mock_templates', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createTemplate(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/notifications/templates', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const temps = JSON.parse(localStorage.getItem('tz_mock_templates') || '[]');
        const newTemp = { id: `temp-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
        temps.push(newTemp);
        localStorage.setItem('tz_mock_templates', JSON.stringify(temps));
        return { success: true, data: newTemp };
      }
    },
    async updateTemplate(id: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/notifications/templates/${id}`, { method: 'PUT', body: JSON.stringify(body), token });
      } catch {
        const temps = JSON.parse(localStorage.getItem('tz_mock_templates') || '[]');
        const idx = temps.findIndex((t: any) => t.id === id);
        if (idx !== -1) {
          temps[idx] = { ...temps[idx], ...body };
          localStorage.setItem('tz_mock_templates', JSON.stringify(temps));
          return { success: true, data: temps[idx] };
        }
        return { success: false, data: null };
      }
    },
    async deleteTemplate(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/notifications/templates/${id}`, { method: 'DELETE', token });
      } catch {
        const temps = JSON.parse(localStorage.getItem('tz_mock_templates') || '[]');
        const filtered = temps.filter((t: any) => t.id !== id);
        localStorage.setItem('tz_mock_templates', JSON.stringify(filtered));
        return { success: true, data: null };
      }
    },
    async fetchSchedulerJobs(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/automation/scheduler/jobs', { token });
      } catch {
        return {
          success: true,
          data: [
            { name: 'LOW_STOCK_SCAN', description: 'Checks branch parts inventory counts against low buffer limits.', cron: '0 9 * * *' },
            { name: 'WARRANTY_EXPIRY_SCAN', description: 'Scans warranties expiring within 30 days and sends alerts.', cron: '0 10 * * *' },
            { name: 'PENDING_PAYMENT_SCAN', description: 'Scans unpaid invoices past 14 days and triggers collection.', cron: '0 11 * * *' },
            { name: 'DAILY_CLOSING', description: 'Scans branches checking daily cash drawer balancing compliance.', cron: '0 23 * * *' }
          ]
        };
      }
    },
    async fetchSchedulerLogs(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/automation/scheduler/logs', { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'log-1', jobName: 'LOW_STOCK_SCAN', status: 'SUCCESS', message: 'Scanned 12 items, 2 warning triggers sent', startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() }
          ]
        };
      }
    },
    async triggerScheduler(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/automation/scheduler/trigger', { method: 'POST', token });
      } catch {
        return { success: true, data: null };
      }
    }
  },

  notifications: {
    async fetchNotifications(filters?: any, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (filters?.read !== undefined) q.set('read', String(filters.read));
        if (filters?.archived !== undefined) q.set('archived', String(filters.archived));
        return await apiRequest<ApiResponse<any[]>>(`/notifications?${q.toString()}`, { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_notifications');
        if (!stored) {
          const defaults = [
            { id: 'notif-1', title: 'Low Stock Alert', message: 'iPhone 13 screen assembly is below minimum buffer threshold.', type: 'WARNING', priority: 'HIGH', channel: 'IN_APP', isRead: false, createdAt: new Date().toISOString() },
            { id: 'notif-2', title: 'Payment Settled', message: 'Payment of ৳12,500 received for Invoice #TZ-INV-1092.', type: 'SUCCESS', priority: 'MEDIUM', channel: 'IN_APP', isRead: false, createdAt: new Date().toISOString() }
          ];
          localStorage.setItem('tz_mock_notifications', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async markRead(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/notifications/${id}/read`, { method: 'PATCH', token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_notifications') || '[]');
        const idx = list.findIndex((n: any) => n.id === id);
        if (idx !== -1) {
          list[idx].isRead = true;
          localStorage.setItem('tz_mock_notifications', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async markAllRead(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/notifications/read-all', { method: 'POST', token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_notifications') || '[]');
        list.forEach((n: any) => n.isRead = true);
        localStorage.setItem('tz_mock_notifications', JSON.stringify(list));
        return { success: true, data: null };
      }
    },
    async archiveNotification(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/notifications/${id}/archive`, { method: 'PATCH', token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_notifications') || '[]');
        const idx = list.findIndex((n: any) => n.id === id);
        if (idx !== -1) {
          list[idx].isArchived = true;
          localStorage.setItem('tz_mock_notifications', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async deleteNotification(id: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/notifications/${id}`, { method: 'DELETE', token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_notifications') || '[]');
        const filtered = list.filter((n: any) => n.id !== id);
        localStorage.setItem('tz_mock_notifications', JSON.stringify(filtered));
        return { success: true, data: null };
      }
    },
    async getUnreadCount(token?: string): Promise<ApiResponse<{ count: number }>> {
      try {
        return await apiRequest<ApiResponse<{ count: number }>>('/notifications/unread-count', { token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_notifications') || '[]');
        const count = list.filter((n: any) => !n.isRead && !n.isArchived).length;
        return { success: true, data: { count } };
      }
    },
    async getPreferences(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/notifications/preferences', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: {} };
        const stored = localStorage.getItem('tz_mock_notif_prefs');
        if (!stored) {
          const defaults = { emailEnabled: true, smsEnabled: true, inAppEnabled: true, pushEnabled: true, whatsappEnabled: false, workingHoursStart: '09:00', workingHoursEnd: '18:00', dndEnabled: false, mutedCategories: [] };
          localStorage.setItem('tz_mock_notif_prefs', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async updatePreferences(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/notifications/preferences', { method: 'PUT', body: JSON.stringify(body), token });
      } catch {
        localStorage.setItem('tz_mock_notif_prefs', JSON.stringify(body));
        return { success: true, data: body };
      }
    }
  },

  tasks: {
    async fetchTasks(filters?: any, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (filters?.status) q.set('status', filters.status);
        if (filters?.priority) q.set('priority', filters.priority);
        return await apiRequest<ApiResponse<any[]>>(`/tasks?${q.toString()}`, { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_tasks');
        if (!stored) {
          const defaults = [
            { id: 'task-1', title: 'Bench test display panels', description: 'Complete QC check on imported display assemblies.', deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), priority: 'HIGH', status: 'IN_PROGRESS', progress: 40, comments: [], attachments: [], assignedTo: { firstName: 'Marcus', lastName: 'Aurelius' } },
            { id: 'task-2', title: 'Reconcile cashier drawer', description: 'Balance cash ledger registers with physically deposited cash.', deadline: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(), priority: 'HIGH', status: 'PENDING', progress: 0, comments: [], attachments: [], assignedTo: { firstName: 'Zahid', lastName: 'Hasan' } }
          ];
          localStorage.setItem('tz_mock_tasks', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createTask(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/tasks', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_tasks') || '[]');
        const newTask = { id: `task-${Date.now()}`, ...body, progress: 0, comments: [], attachments: [], createdAt: new Date().toISOString() };
        list.push(newTask);
        localStorage.setItem('tz_mock_tasks', JSON.stringify(list));
        return { success: true, data: newTask };
      }
    },
    async updateTask(id: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_tasks') || '[]');
        const idx = list.findIndex((t: any) => t.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...body };
          localStorage.setItem('tz_mock_tasks', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async addComment(id: string, comment: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_tasks') || '[]');
        const idx = list.findIndex((t: any) => t.id === id);
        if (idx !== -1) {
          const newComment = { id: `c-${Date.now()}`, comment, createdAt: new Date().toISOString(), user: { firstName: 'You', lastName: '' } };
          list[idx].comments = list[idx].comments || [];
          list[idx].comments.unshift(newComment);
          localStorage.setItem('tz_mock_tasks', JSON.stringify(list));
          return { success: true, data: newComment };
        }
        return { success: false, data: null };
      }
    }
  },

  announcements: {
    async fetchAnnouncements(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/announcements', { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'ann-1', title: 'Eid-ul-Adha Office Closing Hours', content: 'Our labs and desks will remain closed from July 15 to July 18. Regular operations resume July 19.', targetType: 'ALL', createdAt: new Date().toISOString() }
          ]
        };
      }
    },
    async createAnnouncement(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/announcements', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: { id: `ann-${Date.now()}`, ...body, createdAt: new Date().toISOString() } };
      }
    }
  },

  timeline: {
    async fetchTimeline(filters?: any, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = new URLSearchParams();
        if (filters?.module) q.set('module', filters.module);
        if (filters?.search) q.set('search', filters.search);
        return await apiRequest<ApiResponse<any>>(`/timeline?${q.toString()}`, { token });
      } catch {
        return {
          success: true,
          data: {
            items: [
              { id: 'act-1', module: 'AUTH', action: 'LOGIN', details: 'User admin@trustzone.care logged in successfully.', createdAt: new Date().toISOString() },
              { id: 'act-2', module: 'FINANCE', action: 'PAYMENT_RECEIVED', details: 'Payment of ৳12,500 settled for Invoice #TZ-INV-1092.', createdAt: new Date().toISOString() }
            ],
            total: 2
          }
        };
      }
    },
    async fetchAuditLogs(filters?: any, token?: string): Promise<ApiResponse<any>> {
      try {
        const q = new URLSearchParams();
        if (filters?.module) q.set('module', filters.module);
        if (filters?.recordId) q.set('recordId', filters.recordId);
        return await apiRequest<ApiResponse<any>>(`/timeline/audit?${q.toString()}`, { token });
      } catch {
        return {
          success: true,
          data: {
            items: [
              { id: 'audit-1', affectedModule: 'TICKETS', action: 'UPDATE', recordId: 't-1', beforeValue: { status: 'booked' }, afterValue: { status: 'diagnosing' }, userEmail: 'tech@trustzone.care', userRole: 'TECHNICIAN', createdAt: new Date().toISOString() }
            ],
            total: 1
          }
        };
      }
    }
  },

  chat: {
    async fetchContacts(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/chat/contacts', { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'u-1', firstName: 'Marcus', lastName: 'Aurelius', role: 'TECHNICIAN', isOnline: true, branch: { name: 'Downtown Desk' } },
            { id: 'u-2', firstName: 'Zahid', lastName: 'Hasan', role: 'MANAGER', isOnline: false, branch: { name: 'Downtown Desk' } }
          ]
        };
      }
    },
    async fetchMessages(contactId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/chat/messages?contactId=${contactId}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'm-1', senderId: contactId, receiverId: 'me', message: 'Hello! Is the iPhone screen bench tested yet?', createdAt: new Date().toISOString() }
          ]
        };
      }
    },
    async sendMessage(receiverId: string, message: string, attachments?: string[], token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/chat/messages', { method: 'POST', body: JSON.stringify({ receiverId, message, attachments }), token });
      } catch {
        return { success: true, data: { id: `m-${Date.now()}`, senderId: 'me', receiverId, message, attachments, createdAt: new Date().toISOString() } };
      }
    },
    async markRead(contactId: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/chat/messages/read', { method: 'POST', body: JSON.stringify({ contactId }), token });
      } catch {
        return { success: true, data: null };
      }
    }
  },

  calendar: {
    async fetchCalendarEvents(startDate?: string, endDate?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (startDate) q.set('startDate', startDate);
        if (endDate) q.set('endDate', endDate);
        return await apiRequest<ApiResponse<any[]>>(`/calendar?${q.toString()}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'cal-1', title: 'Meeting: Weekly Branch Sync', description: 'Weekly alignment.', start: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(), end: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(), type: 'meeting', priority: 'MEDIUM', status: 'ACTIVE' },
            { id: 'cal-2', title: 'Repair SLA Deadline: iPhone 13 Pro', start: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), end: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), type: 'repair', priority: 'HIGH', status: 'IN_PROGRESS' }
          ]
        };
      }
    },
    async createEvent(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/calendar', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: { id: `cal-${Date.now()}`, ...body } };
      }
    }
  },

  search: {
    async globalQuery(q: string, limit?: number, token?: string): Promise<ApiResponse<any>> {
      try {
        const lim = limit ? `&limit=${limit}` : '';
        return await apiRequest<ApiResponse<any>>(`/search?q=${q}${lim}`, { token });
      } catch {
        return {
          success: true,
          data: {
            tickets: [],
            customers: [],
            invoices: [],
            warranties: [],
            tasks: []
          }
        };
      }
    }
  },

  exports: {
    async fetchJobs(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/export/jobs', { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'exp-1', exportType: 'CSV', module: 'TICKETS', status: 'COMPLETED', fileUrl: '#', fileSize: 1042, createdAt: new Date().toISOString() }
          ]
        };
      }
    },
    async triggerExport(module: string, format: 'CSV' | 'EXCEL' | 'PDF', token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/export/trigger', { method: 'POST', body: JSON.stringify({ module, format }), token });
      } catch {
        return {
          success: true,
          data: { id: `exp-${Date.now()}`, exportType: format, module, status: 'COMPLETED', fileUrl: '#', fileSize: 500, createdAt: new Date().toISOString() }
        };
      }
    }
  },

  systemEnterprise: {
    async fetchWorkflows(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/system-enterprise/workflows', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async createWorkflow(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/system-enterprise/workflows', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: body };
      }
    },
    async fetchForms(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/system-enterprise/forms', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async createFormSchema(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/system-enterprise/forms', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: body };
      }
    },
    async fetchReports(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/system-enterprise/reports', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async runReport(module: string, config: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/system-enterprise/reports/run', { method: 'POST', body: JSON.stringify({ module, config }), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async globalSearch(q: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/system-enterprise/search?q=${q}`, { token });
      } catch {
        return { success: true, data: { users: [], customers: [], parts: [], tickets: [] } };
      }
    }
  },

  hrms: {
    async fetchEmployees(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/hrms/employees', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_employees');
        if (!stored) {
          const defaults = [
            { userId: 'u-1', department: 'Operations', designation: 'Senior Technician', employmentStatus: 'ACTIVE', joiningDate: '2025-01-10', idCardNumber: 'TZ-EMP-1092', skills: ['iPhone Diagnostics', 'Micro-soldering'], certifications: ['Apple Certified Technician'], user: { firstName: 'Marcus', lastName: 'Aurelius', email: 'marcus@trustzone.care', role: 'TECHNICIAN' } },
            { userId: 'u-2', department: 'Customer Support', designation: 'Support Lead', employmentStatus: 'ACTIVE', joiningDate: '2025-03-15', idCardNumber: 'TZ-EMP-1083', skills: ['Customer Relations', 'Billing'], certifications: [], user: { firstName: 'Zahid', lastName: 'Hasan', email: 'zahid@trustzone.care', role: 'MANAGER' } }
          ];
          localStorage.setItem('tz_mock_employees', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async fetchEmployee(userId: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/employees/${userId}`, { token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_employees') || '[]');
        const matched = list.find((e: any) => e.userId === userId);
        return { success: !!matched, data: matched || null };
      }
    },
    async createEmployee(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/employees', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_employees') || '[]');
        const newEmp = { ...body, employmentStatus: 'ACTIVE', joiningDate: new Date().toISOString() };
        list.push(newEmp);
        localStorage.setItem('tz_mock_employees', JSON.stringify(list));
        return { success: true, data: newEmp };
      }
    },
    async updateEmployee(userId: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/employees/${userId}`, { method: 'PUT', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_employees') || '[]');
        const idx = list.findIndex((e: any) => e.userId === userId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...body };
          localStorage.setItem('tz_mock_employees', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async clockIn(latitude?: number, longitude?: number, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/attendance/clock-in', { method: 'POST', body: JSON.stringify({ latitude, longitude }), token });
      } catch {
        return { success: true, data: { status: 'present', checkIn: new Date().toISOString() } };
      }
    },
    async clockOut(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/attendance/clock-out', { method: 'POST', token });
      } catch {
        return { success: true, data: { checkOut: new Date().toISOString() } };
      }
    },
    async breakStart(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/attendance/break-start', { method: 'POST', token });
      } catch {
        return { success: true, data: null };
      }
    },
    async breakEnd(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/attendance/break-end', { method: 'POST', token });
      } catch {
        return { success: true, data: null };
      }
    },
    async fetchAttendanceLogs(userId?: string, date?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = new URLSearchParams();
        if (userId) q.set('userId', userId);
        if (date) q.set('date', date);
        return await apiRequest<ApiResponse<any[]>>(`/hrms/attendance/logs?${q.toString()}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'att-1', userId: 'u-1', date: new Date().toISOString(), status: 'present', checkIn: new Date().toISOString(), checkOut: new Date().toISOString(), user: { firstName: 'Marcus', lastName: 'Aurelius', role: 'TECHNICIAN' } }
          ]
        };
      }
    },
    async correctAttendance(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/attendance/correct', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async fetchLeaveRequests(userId?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = userId ? `?userId=${userId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/hrms/leave/requests${q}`, { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_leaves');
        if (!stored) {
          const defaults = [
            { id: 'lv-1', userId: 'u-1', startDate: '2026-07-20', endDate: '2026-07-22', reason: 'Family event', leaveType: 'CASUAL', status: 'pending', user: { firstName: 'Marcus', lastName: 'Aurelius' } }
          ];
          localStorage.setItem('tz_mock_leaves', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async applyLeave(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/leave/requests', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_leaves') || '[]');
        const newLv = { id: `lv-${Date.now()}`, ...body, status: 'pending', createdAt: new Date().toISOString() };
        list.push(newLv);
        localStorage.setItem('tz_mock_leaves', JSON.stringify(list));
        return { success: true, data: newLv };
      }
    },
    async approveLeave(id: string, status: 'approved' | 'rejected', rejectionReason?: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/leave/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_leaves') || '[]');
        const idx = list.findIndex((l: any) => l.id === id);
        if (idx !== -1) {
          list[idx].status = status;
          list[idx].rejectionReason = rejectionReason || null;
          localStorage.setItem('tz_mock_leaves', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async fetchLeaveBalances(userId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/hrms/leave/balances/${userId}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { leaveType: 'ANNUAL', yearlyEntitlement: 15, used: 2 },
            { leaveType: 'SICK', yearlyEntitlement: 10, used: 1 },
            { leaveType: 'CASUAL', yearlyEntitlement: 10, used: 0 }
          ]
        };
      }
    },
    async fetchShifts(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/hrms/shifts', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_shifts');
        if (!stored) {
          const defaults = [
            { id: 'sh-1', name: 'Morning Shift', startTime: '09:00', endTime: '17:00', graceMinutes: 15, overtimeMultiplier: 1.5 },
            { id: 'sh-2', name: 'Evening Shift', startTime: '17:00', endTime: '01:00', graceMinutes: 15, overtimeMultiplier: 1.5 }
          ];
          localStorage.setItem('tz_mock_shifts', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createShift(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/shifts', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_shifts') || '[]');
        const newShift = { id: `sh-${Date.now()}`, ...body };
        list.push(newShift);
        localStorage.setItem('tz_mock_shifts', JSON.stringify(list));
        return { success: true, data: newShift };
      }
    },
    async assignShift(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/shifts/assign', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async savePayrollStructure(userId: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/payroll/structures', { method: 'POST', body: JSON.stringify({ userId, ...body }), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async generatePayslips(month: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/payroll/payslips/generate', { method: 'POST', body: JSON.stringify({ month }), token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const defaults = [
          { id: 'ps-1', userId: 'u-1', month, basicSalary: 45000, allowances: 5000, deductions: 2500, netPay: 47500, status: 'PENDING', user: { firstName: 'Marcus', lastName: 'Aurelius' } }
        ];
        localStorage.setItem('tz_mock_payslips', JSON.stringify(defaults));
        return { success: true, data: defaults };
      }
    },
    async fetchPayslips(userId?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        const q = userId ? `?userId=${userId}` : '';
        return await apiRequest<ApiResponse<any[]>>(`/hrms/payroll/payslips${q}`, { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        return {
          success: true,
          data: JSON.parse(localStorage.getItem('tz_mock_payslips') || '[]')
        };
      }
    },
    async payPayslip(id: string, status: 'APPROVED' | 'PAID', token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/payroll/payslips/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_payslips') || '[]');
        const idx = list.findIndex((p: any) => p.id === id);
        if (idx !== -1) {
          list[idx].status = status;
          localStorage.setItem('tz_mock_payslips', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async submitPerformanceReview(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/performance/reviews', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async fetchPerformanceReviews(userId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/hrms/performance/reviews/${userId}`, { token });
      } catch {
        return {
          success: true,
          data: [
            { id: 'rev-1', userId, rating: 4.5, kpis: { speed: 5, quality: 4 }, comments: 'Great performance this month.', reviewDate: new Date().toISOString() }
          ]
        };
      }
    },
    async createJobOpening(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/recruitment/jobs', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: null };
        const list = JSON.parse(localStorage.getItem('tz_mock_jobs') || '[]');
        const newJob = { id: `job-${Date.now()}`, ...body, status: 'OPEN', applicants: [] };
        list.push(newJob);
        localStorage.setItem('tz_mock_jobs', JSON.stringify(list));
        return { success: true, data: newJob };
      }
    },
    async fetchJobOpenings(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/hrms/recruitment/jobs', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_jobs');
        if (!stored) {
          const defaults = [
            { id: 'job-1', title: 'Mobile Repair Technician', department: 'Operations', description: 'Requires micro-soldering and iOS diagnostics experience.', status: 'OPEN', applicants: [] }
          ];
          localStorage.setItem('tz_mock_jobs', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createJobApplicant(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/recruitment/applicants', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async updateApplicantStatus(id: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/recruitment/applicants/${id}/status`, { method: 'PATCH', body: JSON.stringify(body), token });
      } catch {
        return { success: true, data: null };
      }
    },
    async fetchDashboardMetrics(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/analytics/dashboard', { token });
      } catch {
        return {
          success: true,
          data: {
            activeStaff: 2,
            leaveRequestsPending: 1,
            presentToday: 1,
            openPositions: 1
          }
        };
      }
    },
    async fetchForecasts(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/forecasts', { token });
      } catch {
        return {
          success: true,
          data: {
            headcount: {
              history: [12, 14, 15, 16, 17, 18],
              linearForecast: [19, 20, 21],
              movingAverageForecast: 17
            },
            payroll: {
              history: [360000, 395000, 420000, 450000, 470000, 490000],
              linearForecast: [515000, 540000, 565000],
              movingAverageForecast: 470000
            }
          }
        };
      }
    },
    async fetchAssets(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/hrms/assets', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_assets');
        if (!stored) {
          const defaults = [
            { id: 'ast-1', name: 'Workstation Laptop', assetType: 'LAPTOP', serialNumber: 'SN-991029', assignedToId: 'u-1', status: 'ASSIGNED', assignedDate: new Date().toISOString(), assignedTo: { firstName: 'Marcus', lastName: 'Aurelius' } }
          ];
          localStorage.setItem('tz_mock_assets', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createAsset(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/assets', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_assets') || '[]');
        const newAsset = { id: `ast-${Date.now()}`, ...body, status: 'ASSIGNED', assignedDate: new Date().toISOString(), assignedTo: { firstName: 'Employee', lastName: 'Member' } };
        list.push(newAsset);
        localStorage.setItem('tz_mock_assets', JSON.stringify(list));
        return { success: true, data: newAsset };
      }
    },
    async returnAsset(id: string, status: string, damageReport?: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/assets/${id}/return`, { method: 'PATCH', body: JSON.stringify({ status, damageReport }), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_assets') || '[]');
        const idx = list.findIndex((a: any) => a.id === id);
        if (idx !== -1) {
          list[idx].status = status;
          list[idx].damageReport = damageReport || null;
          list[idx].returnDate = new Date().toISOString();
          localStorage.setItem('tz_mock_assets', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async fetchGoals(userId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/hrms/goals/${userId}`, { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_goals');
        if (!stored) {
          const defaults = [
            { id: 'goal-1', userId, type: 'OKR', title: 'Achieve 98% repair success index', objective: 'Elevate board diagnostics accuracy', keyResults: [{ id: 'kr-1', title: 'ESD grounding checklist adherence', progress: 85 }], targetDate: new Date().toISOString(), status: 'PENDING' }
          ];
          localStorage.setItem('tz_mock_goals', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createGoal(userId: string, body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/goals/${userId}`, { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_goals') || '[]');
        const newGoal = { id: `goal-${Date.now()}`, userId, status: 'PENDING', ...body };
        list.push(newGoal);
        localStorage.setItem('tz_mock_goals', JSON.stringify(list));
        return { success: true, data: newGoal };
      }
    },
    async updateGoal(id: string, keyResults: any, status: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/goals/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ keyResults, status }), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_goals') || '[]');
        const idx = list.findIndex((g: any) => g.id === id);
        if (idx !== -1) {
          list[idx].keyResults = keyResults;
          list[idx].status = status;
          localStorage.setItem('tz_mock_goals', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    },
    async fetchCourses(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/hrms/courses', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_courses');
        if (!stored) {
          const defaults = [
            { id: 'crs-1', title: 'ESD Safety & Diagnostic Protocols', description: 'Mandatory standard compliance training for technicians.', sessions: [] }
          ];
          localStorage.setItem('tz_mock_courses', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createCourse(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/courses', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_courses') || '[]');
        const newC = { id: `crs-${Date.now()}`, ...body, sessions: [] };
        list.push(newC);
        localStorage.setItem('tz_mock_courses', JSON.stringify(list));
        return { success: true, data: newC };
      }
    },
    async fetchSessions(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/hrms/sessions', { token });
      } catch {
        if (typeof window === 'undefined') return { success: true, data: [] };
        const stored = localStorage.getItem('tz_mock_sessions');
        if (!stored) {
          const defaults = [
            { id: 'sess-1', courseId: 'crs-1', sessionDate: new Date().toISOString(), location: 'Classroom A', participants: [], course: { title: 'ESD Safety & Diagnostic Protocols' } }
          ];
          localStorage.setItem('tz_mock_sessions', JSON.stringify(defaults));
          return { success: true, data: defaults };
        }
        return { success: true, data: JSON.parse(stored) };
      }
    },
    async createSession(body: any, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/hrms/sessions', { method: 'POST', body: JSON.stringify(body), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_sessions') || '[]');
        const newS = { id: `sess-${Date.now()}`, ...body, participants: [], course: { title: 'Diagnostic Course' } };
        list.push(newS);
        localStorage.setItem('tz_mock_sessions', JSON.stringify(list));
        return { success: true, data: newS };
      }
    },
    async registerSessionParticipant(id: string, userId: string, status: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/hrms/sessions/${id}/register`, { method: 'POST', body: JSON.stringify({ userId, status }), token });
      } catch {
        const list = JSON.parse(localStorage.getItem('tz_mock_sessions') || '[]');
        const idx = list.findIndex((s: any) => s.id === id);
        if (idx !== -1) {
          const participants = list[idx].participants || [];
          const pIdx = participants.findIndex((p: any) => p.userId === userId);
          if (pIdx !== -1) {
            participants[pIdx].status = status;
          } else {
            participants.push({ userId, status });
          }
          list[idx].participants = participants;
          localStorage.setItem('tz_mock_sessions', JSON.stringify(list));
          return { success: true, data: list[idx] };
        }
        return { success: false, data: null };
      }
    }
  },

  marketing: {
    async fetchDashboardStats(token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>('/marketing/dashboard/stats', { token });
      } catch {
        return {
          success: true,
          data: {
            campaignOverview: { totalCampaigns: 12, activeCampaigns: 3, scheduledCampaigns: 2, completedCampaigns: 6, failedCampaigns: 1 },
            metrics: { openRate: 82.4, clickRate: 41.8, conversionRate: 18.5, customerEngagementScore: 94.2, campaignRevenue: 125000, totalBudget: 50000, actualCostSpent: 32000 }
          }
        };
      }
    },
    async fetchCampaigns(query?: { channel?: string; status?: string; search?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        let q = '';
        if (query) {
          const parts = [];
          if (query.channel) parts.push(`channel=${query.channel}`);
          if (query.status) parts.push(`status=${query.status}`);
          if (query.search) parts.push(`search=${encodeURIComponent(query.search)}`);
          if (parts.length > 0) q = '?' + parts.join('&');
        }
        return await apiRequest<ApiResponse<any[]>>(`/marketing/campaigns${q}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchCampaign(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/campaigns/${id}`, { token });
    },
    async createCampaign(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/marketing/campaigns', { method: 'POST', body: JSON.stringify(data), token });
    },
    async updateCampaign(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    },
    async deleteCampaign(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/campaigns/${id}`, { method: 'DELETE', token });
    },
    async duplicateCampaign(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/campaigns/${id}/duplicate`, { method: 'POST', token });
    },
    async updateCampaignStatus(id: string, status: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token });
    },
    async executeCampaignSend(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/campaigns/${id}/send`, { method: 'POST', token });
    },
    async fetchAudienceSegments(segment: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/marketing/audience/segments?segment=${segment}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchTemplates(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/marketing/templates', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchAutomationRules(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/marketing/automation/rules', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async triggerAutomationRule(event: string, payload: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/marketing/automation/trigger', { method: 'POST', body: JSON.stringify({ event, payload }), token });
    },
    async createTemplate(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/marketing/templates', { method: 'POST', body: JSON.stringify(data), token });
    },
    async updateTemplate(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/templates/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    },
    async deleteTemplate(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/templates/${id}`, { method: 'DELETE', token });
    },
    async fetchCoupons(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/marketing/coupons', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async createCoupon(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/marketing/coupons', { method: 'POST', body: JSON.stringify(data), token });
    },
    async updateCoupon(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    },
    async deleteCoupon(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/marketing/coupons/${id}`, { method: 'DELETE', token });
    },
    async fetchReferrals(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/marketing/referrals', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchAnalytics(campaignId?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/marketing/analytics${campaignId ? `?campaignId=${campaignId}` : ''}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    }
  },

  branches: {
    async fetchDashboardStats(branchId?: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/branches/dashboard/stats${branchId ? `?branchId=${branchId}` : ''}`, { token });
      } catch {
        return {
          success: true,
          data: {
            overview: { totalBranches: 3, activeBranches: 3, inactiveBranches: 0, maintenanceBranches: 0 },
            metrics: { dailyRevenue: 45800, monthlyRevenue: 850000, repairCount: 142, technicianCount: 12, inventoryValue: 640000, customerCount: 380 }
          }
        };
      }
    },
    async list(query?: { search?: string; status?: string; district?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        let q = '';
        if (query) {
          const parts = [];
          if (query.search) parts.push(`search=${encodeURIComponent(query.search)}`);
          if (query.status) parts.push(`status=${query.status}`);
          if (query.district) parts.push(`district=${encodeURIComponent(query.district)}`);
          if (parts.length > 0) q = '?' + parts.join('&');
        }
        return await apiRequest<ApiResponse<any[]>>(`/branches${q}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchBranch(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/${id}`, { token });
    },
    async createBranch(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/branches', { method: 'POST', body: JSON.stringify(data), token });
    },
    async updateBranch(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    },
    async updateBranchStatus(id: string, status: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token });
    },
    async deleteBranch(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/${id}`, { method: 'DELETE', token });
    },
    async fetchStaff(branchId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/branches/${branchId}/staff`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async assignStaff(branchId: string, userId: string, role?: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/${branchId}/staff/assign`, { method: 'POST', body: JSON.stringify({ userId, role }), token });
    },
    async fetchInventory(branchId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/branches/${branchId}/inventory`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchRepairs(branchId: string, status?: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/branches/${branchId}/repairs${status ? `?status=${status}` : ''}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async transferRepair(ticketId: string, targetBranchId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/repairs/${ticketId}/transfer`, { method: 'POST', body: JSON.stringify({ targetBranchId }), token });
    },
    async fetchFinance(branchId: string, token?: string): Promise<ApiResponse<any>> {
      try {
        return await apiRequest<ApiResponse<any>>(`/branches/${branchId}/finance`, { token });
      } catch {
        return { success: true, data: { totalIncome: 450000, totalExpense: 120000, netProfit: 330000, accounts: [] } };
      }
    },
    async performDailyClosing(branchId: string, data: { expectedBalance: number; actualBalance: number; notes?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/${branchId}/finance/daily-closing`, { method: 'POST', body: JSON.stringify(data), token });
    },
    async fetchTransfers(query?: { fromBranchId?: string; toBranchId?: string; status?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        let q = '';
        if (query) {
          const parts = [];
          if (query.fromBranchId) parts.push(`fromBranchId=${query.fromBranchId}`);
          if (query.toBranchId) parts.push(`toBranchId=${query.toBranchId}`);
          if (query.status) parts.push(`status=${query.status}`);
          if (parts.length > 0) q = '?' + parts.join('&');
        }
        return await apiRequest<ApiResponse<any[]>>(`/branches/transfers/list${q}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async createTransfer(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/branches/transfers', { method: 'POST', body: JSON.stringify(data), token });
    },
    async processTransferStatus(id: string, status: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/branches/transfers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token });
    }
  },

  users: {
    async list(query?: { search?: string; role?: string; branchId?: string; status?: string; department?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        let q = '';
        if (query) {
          const parts = [];
          if (query.search) parts.push(`search=${encodeURIComponent(query.search)}`);
          if (query.role) parts.push(`role=${encodeURIComponent(query.role)}`);
          if (query.branchId) parts.push(`branchId=${query.branchId}`);
          if (query.status) parts.push(`status=${query.status}`);
          if (query.department) parts.push(`department=${encodeURIComponent(query.department)}`);
          if (parts.length > 0) q = '?' + parts.join('&');
        }
        return await apiRequest<ApiResponse<any[]>>(`/users${q}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async getUser(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/${id}`, { token });
    },
    async createUser(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/users', { method: 'POST', body: JSON.stringify(data), token });
    },
    async updateUser(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    },
    async updateUserStatus(id: string, status: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token });
    },
    async deleteUser(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/${id}`, { method: 'DELETE', token });
    },
    async fetchRoles(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/users/roles/list', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async createRole(data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/users/roles', { method: 'POST', body: JSON.stringify(data), token });
    },
    async updateRole(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/roles/${id}`, { method: 'PUT', body: JSON.stringify(data), token });
    },
    async deleteRole(id: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/roles/${id}`, { method: 'DELETE', token });
    },
    async fetchPermissionMatrix(token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>('/users/permissions/matrix', { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async fetchSessions(userId: string, token?: string): Promise<ApiResponse<any[]>> {
      try {
        return await apiRequest<ApiResponse<any[]>>(`/users/${userId}/sessions`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async terminateSession(sessionId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/sessions/${sessionId}`, { method: 'DELETE', token });
    },
    async logoutAllDevices(userId: string, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>(`/users/${userId}/sessions/logout-all`, { method: 'POST', token });
    },
    async fetchActivityLogs(query?: { userId?: string; action?: string }, token?: string): Promise<ApiResponse<any[]>> {
      try {
        let q = '';
        if (query) {
          const parts = [];
          if (query.userId) parts.push(`userId=${query.userId}`);
          if (query.action) parts.push(`action=${query.action}`);
          if (parts.length > 0) q = '?' + parts.join('&');
        }
        return await apiRequest<ApiResponse<any[]>>(`/users/logs/activity${q}`, { token });
      } catch {
        return { success: true, data: [] };
      }
    },
    async handleBulkAction(data: { userIds: string[]; action: string; targetValue?: string }, token?: string): Promise<ApiResponse<any>> {
      return apiRequest<ApiResponse<any>>('/users/bulk-action', { method: 'POST', body: JSON.stringify(data), token });
    }
  }
};

function getMockWarranties(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tz_mock_warranties');
  if (stored) return JSON.parse(stored);
  
  const defaults = [
    {
      id: 'warr-1',
      customerId: 'cust-1',
      customer: { firstName: 'Maksudur', lastName: 'Rahman', phone: '01819283746', email: 'maksud@gmail.com' },
      branchId: 'branch-1',
      branch: { name: 'Downtown Desk' },
      warrantyNumber: 'TZ-WARR-492104',
      warrantyType: 'SERVICE',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 13 Pro Max',
      serialOrImei: 'IMEI-9921008273412',
      durationMonths: 12,
      startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() + 335 * 24 * 3600 * 1000).toISOString(),
      status: 'ACTIVE',
      coverageDetails: ['Display digitizer glitching', 'Dead backlight lines', 'Adhesive frame locks'],
      exclusions: ['Accidental display drop cracking', 'Water entry', 'Unofficial screen swops'],
      history: [{ action: 'ISSUED', notes: 'Automated issuance upon ticket completion.', createdAt: new Date().toISOString() }],
      claims: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'warr-2',
      customerId: 'cust-2',
      customer: { firstName: 'Nasrin', lastName: 'Akter', phone: '01711928374', email: 'nasrin@yahoo.com' },
      branchId: 'branch-1',
      branch: { name: 'Downtown Desk' },
      warrantyNumber: 'TZ-WARR-772109',
      warrantyType: 'PARTS',
      deviceBrand: 'Samsung',
      deviceModel: 'Galaxy S22 Ultra',
      serialOrImei: 'IMEI-8831002231012',
      durationMonths: 6,
      startDate: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      status: 'ACTIVE',
      coverageDetails: ['Battery fast draining', 'Charging port logic connection'],
      exclusions: ['Physical port socket breaking', 'Liquid corrosion'],
      history: [{ action: 'ISSUED', notes: 'Manual parts replacement warranty certificate.', createdAt: new Date().toISOString() }],
      claims: [],
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem('tz_mock_warranties', JSON.stringify(defaults));
  return defaults;
}

function saveMockWarranties(data: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tz_mock_warranties', JSON.stringify(data));
  }
}

function getMockClaims(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tz_mock_claims');
  if (stored) return JSON.parse(stored);

  const defaults = [
    {
      id: 'clm-1',
      warrantyId: 'warr-1',
      warranty: {
        warrantyNumber: 'TZ-WARR-492104',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13 Pro Max',
        serialOrImei: 'IMEI-9921008273412',
        customer: { firstName: 'Maksudur', lastName: 'Rahman', phone: '01819283746' }
      },
      claimNumber: 'TZ-CLM-902194',
      issueDescription: 'Display touch digitizer started glitching and failing on the left margin area.',
      status: 'PENDING',
      notes: 'Customer reports no drops or water exposure.',
      branchId: 'branch-1',
      branch: { name: 'Downtown Desk' },
      isCovered: false,
      estimatedCost: 0,
      inspectionNotes: '',
      inspectionDiagnosis: '',
      attachments: [],
      inspectionPhotos: [],
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ];
  localStorage.setItem('tz_mock_claims', JSON.stringify(defaults));
  return defaults;
}

function saveMockClaims(data: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tz_mock_claims', JSON.stringify(data));
  }
}

function getMockRmas(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tz_mock_rmas');
  if (stored) return JSON.parse(stored);

  const defaults = [
    {
      id: 'rma-1',
      rmaNumber: 'TZ-RMA-802194',
      partId: 'part-1',
      part: { name: 'iPhone 13 OLED Digitizer Assembly', basePrice: 4200 },
      supplierId: 'supplier-1',
      supplier: { name: 'M/S Tech Suppliers Ltd' },
      branchId: 'branch-1',
      branch: { name: 'Downtown Desk' },
      quantity: 2,
      reason: 'Flickering display backlight right after package unboxing and bench testing.',
      status: 'SHIPPED',
      courier: 'Pathao Delivery',
      trackingNumber: 'PTH-9921841',
      vendorReference: 'VR-88219',
      replacementEta: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      notes: 'Sent in original box packaging with seal intact.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    }
  ];
  localStorage.setItem('tz_mock_rmas', JSON.stringify(defaults));
  return defaults;
}

function saveMockRmas(data: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tz_mock_rmas', JSON.stringify(data));
  }
}

