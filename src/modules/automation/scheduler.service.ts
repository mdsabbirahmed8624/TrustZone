import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { eventBus, AutomationEvents } from '../../common/event-bus';

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private tickInterval: NodeJS.Timeout | null = null;
  private pendingTimeouts: NodeJS.Timeout[] = [];
  private isProcessing = false;
  private isDestroyed = false;
  private lastAutoScanDate: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.startSchedulerLoopWithRetry();
  }

  private async startSchedulerLoopWithRetry() {
    if (this.isDestroyed) return;
    const isReady = await this.isDatabaseReady();
    if (isReady) {
      console.log('[Scheduler] Database is ready. Starting tick loop.');
      // Check hourly whether today's daily scans have been executed
      this.tickInterval = setInterval(
        () => this.runScheduledScans(true),
        3600000,
      );
      // Execute a scan immediately in background after 5s startup delay
      const startupTimeout = setTimeout(() => this.runScheduledScans(), 5000);
      this.pendingTimeouts.push(startupTimeout);
    } else {
      console.warn(
        '[Scheduler] Database is not ready or missing tables. Retrying in 10 seconds...',
      );
      const retryTimeout = setTimeout(
        () => this.startSchedulerLoopWithRetry(),
        10000,
      );
      this.pendingTimeouts.push(retryTimeout);
    }
  }

  private async isDatabaseReady(): Promise<boolean> {
    try {
      // Query a simple check on the schedulerLog table to see if it exists and is queryable
      await this.prisma.schedulerLog.findFirst({ select: { id: true } });
      return true;
    } catch (err) {
      return false;
    }
  }

  onModuleDestroy() {
    this.isDestroyed = true;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
    for (const t of this.pendingTimeouts) {
      clearTimeout(t);
    }
    this.pendingTimeouts = [];
  }

  // ==========================================
  // Scheduled Scans Orchestrator
  // ==========================================
  async runScheduledScans(isAutoTick = false) {
    if (this.isProcessing || this.isDestroyed) return;
    const todayKey = new Date().toISOString().split('T')[0];
    if (isAutoTick && this.lastAutoScanDate === todayKey) {
      return;
    }
    this.isProcessing = true;
    this.lastAutoScanDate = todayKey;

    console.log(
      '[Scheduler] Initiating daily closing and scanning routines...',
    );

    await this.executeJob('LOW_STOCK_SCAN', () => this.scanLowStock());
    await this.executeJob('WARRANTY_EXPIRY_SCAN', () =>
      this.scanWarrantyExpiry(),
    );
    await this.executeJob('PENDING_PAYMENT_SCAN', () =>
      this.scanPendingPayments(),
    );
    await this.executeJob('DAILY_CLOSING', () => this.scanDailyClosings());

    this.isProcessing = false;
  }

  private async executeJob(
    jobName: string,
    action: () => Promise<string | void>,
  ) {
    const startedAt = new Date();
    try {
      const message = await action();
      await this.prisma.schedulerLog.create({
        data: {
          jobName,
          status: 'SUCCESS',
          message: message || 'Job completed successfully.',
          startedAt,
          finishedAt: new Date(),
        },
      });
    } catch (err: any) {
      await this.prisma.schedulerLog.create({
        data: {
          jobName,
          status: 'FAILED',
          message: err.message,
          startedAt,
          finishedAt: new Date(),
        },
      });
      console.error(
        `[Scheduler Job Error] Job: ${jobName}, Msg: ${err.message}`,
      );
    }
  }

  // ==========================================
  // 1. Low Stock Scan
  // ==========================================
  async scanLowStock(): Promise<string> {
    const inventories = await this.prisma.branchInventory.findMany({
      include: { part: true },
    });

    let count = 0;
    for (const inv of inventories) {
      if (inv.quantity < inv.part.minimumStockBuffer) {
        eventBus.emit(AutomationEvents.STOCK_BELOW_THRESHOLD, {
          partId: inv.partId,
          branchId: inv.branchId,
          quantity: inv.quantity,
          threshold: inv.part.minimumStockBuffer,
        });
        count++;
      }
    }
    return `Scanned ${inventories.length} inventory records. Detected ${count} items below minimum buffer threshold.`;
  }

  // ==========================================
  // 2. Warranty Expiry Scan (30 days warnings)
  // ==========================================
  async scanWarrantyExpiry(): Promise<string> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // warning before 30 days

    const warranties = await this.prisma.warranty.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: targetDate,
          gte: new Date(),
        },
      },
    });

    for (const w of warranties) {
      const diffMs = w.endDate.getTime() - new Date().getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
      );
      eventBus.emit(AutomationEvents.WARRANTY_EXPIRING, {
        warrantyId: w.id,
        daysRemaining,
      });
    }

    return `Processed ${warranties.length} active warranties expiring within 30 days.`;
  }

  // ==========================================
  // 3. Pending Payment Scan (invoice aging past 14 days)
  // ==========================================
  async scanPendingPayments(): Promise<string> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: 'unpaid',
        createdAt: {
          lte: cutoffDate,
        },
      },
    });

    for (const inv of invoices) {
      const diffMs = new Date().getTime() - inv.createdAt.getTime();
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      eventBus.emit(AutomationEvents.INVOICE_OVERDUE, {
        invoiceId: inv.id,
        daysOverdue,
      });
    }

    return `Found ${invoices.length} invoices aging unpaid past 14 days threshold.`;
  }

  // ==========================================
  // 4. Daily Closing scans
  // ==========================================
  async scanDailyClosings(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Scan branches and check if they have closed today, else create warning log
    const branches = await this.prisma.branch.findMany();
    let pendingCount = 0;

    for (const branch of branches) {
      const closing = await this.prisma.dailyClosing.findUnique({
        where: {
          branchId_date: {
            branchId: branch.id,
            date: today,
          },
        },
      });

      if (!closing) {
        pendingCount++;
        // Emit in-app alert or notification to manager about missing closing
        console.warn(
          `[Daily Closing Alert] Branch ${branch.name} has not closed transactions for today!`,
        );
      }
    }
    return `Verified daily closing logs for ${branches.length} branches. ${pendingCount} branches require closing action.`;
  }

  // ==========================================
  // Admin Operations
  // ==========================================
  async listSchedulerJobs() {
    // Return job schema config for Admin Dashboard
    return [
      {
        name: 'LOW_STOCK_SCAN',
        description:
          'Checks branch parts inventory counts against low buffer limits.',
        cron: '0 9 * * *',
      },
      {
        name: 'WARRANTY_EXPIRY_SCAN',
        description:
          'Scans warranties expiring within 30 days and sends alerts.',
        cron: '0 10 * * *',
      },
      {
        name: 'PENDING_PAYMENT_SCAN',
        description:
          'Scans unpaid invoices past 14 days and triggers collection.',
        cron: '0 11 * * *',
      },
      {
        name: 'DAILY_CLOSING',
        description:
          'Scans branches checking daily cash drawer balancing compliance.',
        cron: '0 23 * * *',
      },
    ];
  }

  async getSchedulerLogs() {
    return this.prisma.schedulerLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }
}
