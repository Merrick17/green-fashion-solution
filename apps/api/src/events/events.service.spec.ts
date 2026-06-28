import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const makeUser = (overrides: Partial<{ emailNotifications: boolean; id: string; email: string; role: string }> = {}) => ({
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  role: 'CUSTOMER',
  blocked: false,
  emailNotifications: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeProject = (customerId = 'customer-1') => ({
  id: 'project-1',
  title: 'Test Project',
  customerId,
  status: 'SOURCING',
  customer: makeUser({ id: customerId, email: 'customer@example.com', emailNotifications: true }),
});

describe('EventsService', () => {
  let service: EventsService;
  let mockPrisma: {
    project: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock; findMany: jest.Mock };
    notification: { create: jest.Mock };
  };
  let mockEmail: jest.Mocked<Pick<EmailService, 'send'>>;
  let mockGateway: jest.Mocked<Pick<NotificationsGateway, 'emitToUser'>>;

  beforeEach(async () => {
    mockPrisma = {
      project: { findUnique: jest.fn() },
      user: { findUnique: jest.fn(), findMany: jest.fn() },
      notification: { create: jest.fn() },
    };

    mockEmail = { send: jest.fn().mockResolvedValue(undefined) };
    mockGateway = { emitToUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmail },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyProposalReady', () => {
    it('creates a PROPOSAL_READY notification in DB', async () => {
      const project = makeProject('customer-1');
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (mockPrisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif-1', type: 'PROPOSAL_READY' });

      await service.notifyProposalReady('project-1', 'proposal-1');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'customer-1',
            type: 'PROPOSAL_READY',
          }),
        }),
      );
    });

    it('emits a WebSocket notification event', async () => {
      const project = makeProject('customer-1');
      const notification = { id: 'notif-1', type: 'PROPOSAL_READY', message: 'A new proposal is ready.' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (mockPrisma.notification.create as jest.Mock).mockResolvedValue(notification);

      await service.notifyProposalReady('project-1', 'proposal-1');

      expect(mockGateway.emitToUser).toHaveBeenCalledWith('customer-1', 'notification', notification);
    });

    it('sends email when emailNotifications is true', async () => {
      const project = makeProject('customer-1');
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (mockPrisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif-1' });

      await service.notifyProposalReady('project-1', 'proposal-1');

      expect(mockEmail.send).toHaveBeenCalledWith(
        'customer@example.com',
        expect.stringContaining('New proposal ready'),
        expect.any(String),
      );
    });

    it('skips email when emailNotifications is false', async () => {
      const project = {
        ...makeProject('customer-1'),
        customer: makeUser({ id: 'customer-1', email: 'customer@example.com', emailNotifications: false }),
      };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(project);
      (mockPrisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif-1' });

      await service.notifyProposalReady('project-1', 'proposal-1');

      expect(mockEmail.send).not.toHaveBeenCalled();
    });

    it('does nothing when project is not found', async () => {
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await service.notifyProposalReady('nonexistent-project', 'proposal-x');

      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
      expect(mockEmail.send).not.toHaveBeenCalled();
    });
  });

  describe('notifyTaskAssigned', () => {
    it('creates TASK_ASSIGNED notification for the designer', async () => {
      const designer = makeUser({ id: 'designer-1', email: 'designer@gfs.com', role: 'DESIGNER' });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(designer);
      (mockPrisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif-2', type: 'TASK_ASSIGNED' });

      await service.notifyTaskAssigned('designer-1', 'Source organic linen');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'designer-1',
            type: 'TASK_ASSIGNED',
            message: expect.stringContaining('Source organic linen'),
          }),
        }),
      );
    });

    it('skips notification when designer user is not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await service.notifyTaskAssigned('nonexistent', 'Some task');

      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('getAdminIds', () => {
    it('returns only ADMIN user ids', async () => {
      const admins = [{ id: 'admin-1' }, { id: 'admin-2' }];
      (mockPrisma.user.findMany as jest.Mock).mockResolvedValue(admins);

      const result = await service.getAdminIds();

      expect(result).toEqual(['admin-1', 'admin-2']);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
    });

    it('returns empty array when no admins exist', async () => {
      (mockPrisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAdminIds();

      expect(result).toEqual([]);
    });
  });
});
