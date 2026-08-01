import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Mobile API and Device Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = 'mobile-e2e@trustzone.care';
  const testPassword = 'Password123!';
  const testUser = {
    email: testEmail,
    password: testPassword,
    firstName: 'Mobile',
    lastName: 'Tester',
    phone: '+15550299',
  };

  let token: string;
  let refreshToken: string;
  let deviceId: string;
  let verificationToken: string;
  let ticketId: string;
  let diagnosticId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['api/v2/(.*)'],
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Initial Cleanup
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.diagnosticReportPdf.deleteMany({});
      await prisma.deviceDiagnostic.deleteMany({});
      await prisma.technicianTelemetry.deleteMany({});
      await prisma.ticket.deleteMany({ where: { assignedTechId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.sessionLog.deleteMany({ where: { userId: user.id } });
      await prisma.deviceEvent.deleteMany({
        where: { device: { userId: user.id } },
      });
      await prisma.pushToken.deleteMany({
        where: { device: { userId: user.id } },
      });
      await prisma.userDevice.deleteMany({ where: { userId: user.id } });
      await prisma.device.deleteMany({
        where: { serialNumber: 'SN_SEED_E2E_123' },
      });
      await prisma.customer.deleteMany({
        where: { email: { in: [testEmail, 'seeded.cust@e2e.com'] } },
      });
      await prisma.user.delete({ where: { email: testEmail } });
    }
  });

  afterAll(async () => {
    // Final Cleanup
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.diagnosticReportPdf.deleteMany({});
      await prisma.deviceDiagnostic.deleteMany({});
      await prisma.technicianTelemetry.deleteMany({});
      await prisma.ticket.deleteMany({ where: { assignedTechId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.sessionLog.deleteMany({ where: { userId: user.id } });
      await prisma.deviceEvent.deleteMany({
        where: { device: { userId: user.id } },
      });
      await prisma.pushToken.deleteMany({
        where: { device: { userId: user.id } },
      });
      await prisma.userDevice.deleteMany({ where: { userId: user.id } });
      await prisma.device.deleteMany({
        where: { serialNumber: 'SN_SEED_E2E_123' },
      });
      await prisma.customer.deleteMany({
        where: { email: { in: [testEmail, 'seeded.cust@e2e.com'] } },
      });
      await prisma.user.delete({ where: { email: testEmail } });
    }
    await app.close();
  });

  describe('Registration and Verification', () => {
    it('POST /api/v1/mobile/auth/register (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data).toHaveProperty('verificationToken');
          verificationToken = res.body.data.verificationToken;
        });
    });

    it('POST /api/v1/mobile/auth/verify-email (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Enterprise Device Authentication Flows', () => {
    it('POST /api/v1/mobile/auth/login (Success - Registers Device)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/auth/login')
        .set('x-device-uuid', 'e2e-uuid-1')
        .set('x-device-brand', 'Samsung')
        .set('x-device-model', 'S24 Ultra')
        .set('x-device-type', 'ANDROID')
        .set('x-location-country', 'USA')
        .set('x-location-city', 'New York')
        .set('x-location-timezone', 'EST')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect(async (res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          token = res.body.data.accessToken;
          refreshToken = res.body.data.refreshToken;

          // Verify UserDevice row was created in DB
          const user = await prisma.user.findUnique({
            where: { email: testEmail },
          });
          const device = await prisma.userDevice.findUnique({
            where: {
              userId_deviceUUID: { userId: user.id, deviceUUID: 'e2e-uuid-1' },
            },
          });
          expect(device).toBeDefined();
          expect(device.brand).toBe('Samsung');
          expect(device.model).toBe('S24 Ultra');
          expect(device.country).toBe('USA');
          deviceId = device.id;
        });
    });

    it('POST /api/v1/mobile/auth/login (Success - Duplicate Device updates instead of duplicating)', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      const beforeDevice = await prisma.userDevice.findUnique({
        where: {
          userId_deviceUUID: { userId: user.id, deviceUUID: 'e2e-uuid-1' },
        },
      });

      // Login again
      await request(app.getHttpServer())
        .post('/api/v1/mobile/auth/login')
        .set('x-device-uuid', 'e2e-uuid-1')
        .set('x-device-brand', 'Samsung')
        .set('x-device-model', 'S24 Ultra - Updated')
        .set('x-device-type', 'ANDROID')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      const afterDevice = await prisma.userDevice.findUnique({
        where: {
          userId_deviceUUID: { userId: user.id, deviceUUID: 'e2e-uuid-1' },
        },
      });
      expect(afterDevice.id).toBe(beforeDevice.id);
      expect(afterDevice.model).toBe('S24 Ultra - Updated');
    });

    it('GET /api/v1/mobile/device-mgmt/sessions (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/device-mgmt/sessions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.devices.length).toBeGreaterThan(0);
          expect(res.body.data.sessions.length).toBeGreaterThan(0);
        });
    });

    it('PUT /api/v1/mobile/device-mgmt/:id/push-token (Success)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/mobile/device-mgmt/${deviceId}/push-token`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          provider: 'FCM',
          token: 'firebase-push-token-123',
          isActive: true,
        })
        .expect(200)
        .expect(async (res) => {
          expect(res.body.success).toBe(true);
          const pushToken = await prisma.pushToken.findUnique({
            where: { token: 'firebase-push-token-123' },
          });
          expect(pushToken).toBeDefined();
          expect(pushToken.deviceId).toBe(deviceId);
        });
    });

    it('PUT /api/v1/mobile/device-mgmt/:id/trust (Success)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/mobile/device-mgmt/${deviceId}/trust`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isTrusted: true })
        .expect(200)
        .expect(async (res) => {
          expect(res.body.success).toBe(true);
          const device = await prisma.userDevice.findUnique({
            where: { id: deviceId },
          });
          expect(device.isTrusted).toBe(true);

          // Verify event was logged
          const event = await prisma.deviceEvent.findFirst({
            where: { deviceId, eventType: 'TRUST' },
          });
          expect(event).toBeDefined();
        });
    });

    it('PUT /api/v1/mobile/device-mgmt/:id/remember (Success)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/mobile/device-mgmt/${deviceId}/remember`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rememberDevice: true })
        .expect(200)
        .expect(async (res) => {
          expect(res.body.success).toBe(true);
          const device = await prisma.userDevice.findUnique({
            where: { id: deviceId },
          });
          expect(device.rememberDevice).toBe(true);
        });
    });

    it('POST /api/v1/mobile/auth/refresh (Success - Rotates RTR tokens)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/auth/refresh')
        .set('x-device-uuid', 'e2e-uuid-1')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
          token = res.body.data.accessToken;
          refreshToken = res.body.data.refreshToken;
        });
    });

    it('DELETE /api/v1/mobile/device-mgmt/:id (Success - Revokes and Blocks Device)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/mobile/device-mgmt/${deviceId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(async (res) => {
          expect(res.body.success).toBe(true);
          const device = await prisma.userDevice.findUnique({
            where: { id: deviceId },
          });
          expect(device.status).toBe('BLOCKED');
          expect(device.isAuthorized).toBe(false);

          // Verify session was revoked in DB
          const sessions = await prisma.session.findMany({
            where: { userId: device.userId, deviceFingerprint: 'e2e-uuid-1' },
          });
          expect(sessions.length).toBe(0);
        });
    });

    it('POST /api/v1/mobile/auth/login (Failure - Blocked Device Denied)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/auth/login')
        .set('x-device-uuid', 'e2e-uuid-1')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toContain('blocked');
        });
    });
  });

  describe('Enterprise Push Notification & Real-time Communication (Book 3)', () => {
    it('GET /api/v1/mobile/notifications/preferences (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/notifications/preferences')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('mutedCategories');
        });
    });

    it('PUT /api/v1/mobile/notifications/preferences (Success)', () => {
      return request(app.getHttpServer())
        .put('/api/v1/mobile/notifications/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mutedCategories: ['PROMOTIONAL_SMS'],
          preferredChannels: ['WEBSOCKET', 'PUSH'],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.mutedCategories).toContain('PROMOTIONAL_SMS');
        });
    });

    it('POST /api/v1/mobile/push-devices/register (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/push-devices/register')
        .set('Authorization', `Bearer ${token}`)
        .send({
          deviceUUID: 'e2e-uuid-1',
          deviceFingerprint: 'Google Pixel 8',
          provider: 'FCM',
          pushToken: 'push-token-fcm-e2e',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.pushToken).toBe('push-token-fcm-e2e');
        });
    });

    it('GET /api/v1/mobile/notifications (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.notifications).toBeDefined();
        });
    });

    it('GET /api/v1/mobile/notifications/metrics (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/notifications/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.liveMetrics).toBeDefined();
          expect(res.body.data.slaMetrics).toBeDefined();
        });
    });

    it('GET /api/v1/mobile/notifications/queue-status (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/notifications/queue-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.activeWorkersCount).toBeDefined();
        });
    });

    it('POST /api/v1/mobile/notifications/schedule (Success)', () => {
      const scheduledTime = new Date(Date.now() + 600000).toISOString();
      return request(app.getHttpServer())
        .post('/api/v1/mobile/notifications/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          templateCode: 'OTP_SMS',
          variables: { otpCode: '1234' },
          expression: scheduledTime,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.scheduledAt).toBeDefined();
        });
    });

    it('POST /api/v1/mobile/notifications/ai-generate (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/notifications/ai-generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          prompt: 'Draft an alert for repair ticket completion',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toContain('Repair Completed');
        });
    });

    it('GET /api/v1/mobile/notifications/metrics/prometheus (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/notifications/metrics/prometheus')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('notification_delivery_total');
        });
    });

    it('DELETE /api/v1/mobile/push-devices/:token (Success)', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/mobile/push-devices/push-token-fcm-e2e')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(async (res) => {
          expect(res.body.success).toBe(true);
          const dev = await prisma.pushDevice.findUnique({
            where: { pushToken: 'push-token-fcm-e2e' },
          });
          expect(dev.isActive).toBe(false);
        });
    });

    it('POST /api/v1/mobile/sync/push (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/sync/push')
        .set('Authorization', `Bearer ${token}`)
        .send({
          deviceUUID: 'device-sync-e2e',
          steps: [
            {
              entityName: 'MobileSecurityPolicy',
              entityId: 'e39401ab-2713-4330-8026-621111111111',
              clientUpdatedAt: new Date().toISOString(),
              data: { blockJailbroken: true },
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.batchId).toBeDefined();
        });
    });

    it('POST /api/v1/mobile/sync/push (Blocked Jailbroken)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/sync/push')
        .set('Authorization', `Bearer ${token}`)
        .set('x-security-root', 'true')
        .send({
          deviceUUID: 'device-sync-e2e',
          steps: [],
        })
        .expect(403);
    });

    it('GET /api/v1/mobile/sync/pull (Success)', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v1/mobile/sync/pull?lastSyncTimestamp=2026-01-01T00:00:00.000Z',
        )
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.updates).toBeDefined();
        });
    });

    it('GET /api/v1/mobile/security/policy (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/security/policy')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.blockJailbroken).toBe(true);
        });
    });

    it('Setup ticket for diagnostics tests', async () => {
      let branch = await prisma.branch.findFirst();
      if (!branch) {
        branch = await prisma.branch.create({
          data: {
            name: 'Seeded Branch for Mobile E2E',
            address: 'Branch Address',
            timezone: 'UTC',
            status: 'ACTIVE',
          },
        });
      }
      let customer = await prisma.customer.findFirst();
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            firstName: 'Seeded',
            lastName: 'Customer',
            email: 'seeded.cust@e2e.com',
            phone: '+12345678',
          },
        });
      }
      let device = await prisma.device.findFirst();
      if (!device) {
        device = await prisma.device.create({
          data: {
            brand: 'Apple',
            model: 'iPhone 15 Pro',
            serialNumber: 'SN_SEED_E2E_123',
            customerId: customer.id,
          },
        });
      }
      const user = await prisma.user.findFirst({ where: { email: testEmail } });

      const ticket = await prisma.ticket.create({
        data: {
          branchId: branch.id,
          customerId: customer.id,
          deviceId: device.id,
          assignedTechId: user.id,
          slaDeadline: new Date(Date.now() + 24 * 3600000),
          status: 'booked',
        },
      });

      ticketId = ticket.id;
      expect(ticketId).toBeDefined();
    });

    it('POST /api/v1/mobile/diagnostics (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/diagnostics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ticketId,
          batteryHealth: 78,
          storageRemainingGb: 32.5,
          screenStatus: 'CRACKED',
          cameraStatus: 'OK',
          sensorStatus: 'OK',
          bandwidthDownMbps: 45.2,
          diagnosticNotes: 'Screen is cracked.',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.diagnostic).toBeDefined();
          diagnosticId = res.body.data.diagnostic.id;
        });
    });

    it('GET /api/v1/mobile/diagnostics/ticket/:ticketId (Success)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/mobile/diagnostics/ticket/${ticketId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('POST /api/v1/mobile/diagnostics/:id/report (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/mobile/diagnostics/${diagnosticId}/report`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.pdfUrl).toBeDefined();
        });
    });

    it('POST /api/v1/mobile/telemetry (Success)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/mobile/telemetry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ticketId,
          action: 'DIAGNOSTIC_START',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('GET /api/v1/mobile/telemetry/metrics (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/mobile/telemetry/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.totalRepairsCompleted).toBeDefined();
        });
    });

    // ==========================================
    // Book 6: Work Order Approvals & Billing Sync
    // ==========================================
    it('POST /api/v1/mobile/work-orders/:ticketId/sign (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/mobile/work-orders/${ticketId}/sign`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-security-root', 'SECURE')
        .set('x-device-uuid', 'e2e-uuid-active')
        .send({
          signeeName: 'Customer John Doe',
          signatureBase64:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          latitude: 37.7749,
          longitude: -122.4194,
          ipAddress: '192.168.1.1',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.signatureUrl).toBeDefined();
        });
    });

    it('POST /api/v1/mobile/work-orders/:ticketId/invoice (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/mobile/work-orders/${ticketId}/invoice`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-security-root', 'SECURE')
        .set('x-device-uuid', 'e2e-uuid-active')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.total).toBeDefined();
        });
    });

    it('POST /api/v1/mobile/work-orders/:ticketId/pay (Success)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/mobile/work-orders/${ticketId}/pay`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-security-root', 'SECURE')
        .set('x-device-uuid', 'e2e-uuid-active')
        .send({
          amount: 150.0,
          method: 'CARD',
          transactionRef: 'txn_e2e_pay_1',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('SUCCESS');
        });
    });

    it('GET /api/v1/mobile/work-orders/:ticketId/summary (Success)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/mobile/work-orders/${ticketId}/summary`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-security-root', 'SECURE')
        .set('x-device-uuid', 'e2e-uuid-active')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.isPaid).toBe(true);
          expect(res.body.data.hasSignature).toBe(true);
        });
    });
  });

  describe('Versioning Compatibility (v2)', () => {
    it('GET /api/v2/mobile/auth/ping (Success)', () => {
      return request(app.getHttpServer())
        .get('/api/v2/mobile/auth/ping')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.version).toBe('v2');
        });
    });
  });
});
