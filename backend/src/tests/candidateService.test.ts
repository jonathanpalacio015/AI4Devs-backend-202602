import { assignInterviewScore, getCandidatesInProcessByPosition, updateCandidateStage } from '../../src/application/services/candidateService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    application: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      findFirst: jest.fn(),
    },
    interview: {
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('candidateService - Kanban Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCandidatesInProcessByPosition', () => {
    it('should return empty array when position has no applications', async () => {
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result).toEqual([]);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 1 },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          interviews: {
            select: {
              score: true,
            },
          },
        },
      });
    });

    it('should return candidates with calculated average score', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          currentInterviewStep: 2,
          candidate: { id: 10, firstName: 'John', lastName: 'Doe' },
          interviews: [{ score: 80 }, { score: 90 }],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        applicationId: 1,
        candidateId: 10,
        fullName: 'John Doe',
        current_interview_step: 2,
        averageScore: 85,
        average_score: 85,
      });
    });

    it('should always include required kanban fields', async () => {
      const mockApplications = [
        {
          id: 7,
          positionId: 2,
          currentInterviewStep: 4,
          candidate: { id: 99, firstName: 'Maria', lastName: 'Perez' },
          interviews: [{ score: 70 }, { score: 80 }, { score: 90 }],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(2);

      expect(result[0]).toHaveProperty('fullName', 'Maria Perez');
      expect(result[0]).toHaveProperty('current_interview_step', 4);
      expect(result[0]).toHaveProperty('averageScore', 80);
      expect(result[0]).toHaveProperty('average_score', 80);
    });

    it('should return null average score when no interviews with scores', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          currentInterviewStep: 1,
          candidate: { id: 10, firstName: 'Jane', lastName: 'Smith' },
          interviews: [{ score: null }, { score: null }],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result[0].averageScore).toBeNull();
    });

    it('should handle multiple candidates for the same position', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          currentInterviewStep: 2,
          candidate: { id: 10, firstName: 'John', lastName: 'Doe' },
          interviews: [{ score: 80 }],
        },
        {
          id: 2,
          positionId: 1,
          currentInterviewStep: 1,
          candidate: { id: 11, firstName: 'Jane', lastName: 'Smith' },
          interviews: [{ score: 90 }],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result).toHaveLength(2);
      expect(result[0].fullName).toBe('John Doe');
      expect(result[1].fullName).toBe('Jane Smith');
    });

    it('should trim whitespace from full name', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          currentInterviewStep: 1,
          candidate: { id: 10, firstName: '  John  ', lastName: '  Doe  ' },
          interviews: [],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result[0].fullName).toMatch(/^[A-Z]/);
    });

    it('should handle null firstName with N/A fallback', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          currentInterviewStep: 1,
          candidate: { id: 10, firstName: null, lastName: 'Doe' },
          interviews: [],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result[0].fullName).toContain('Doe');
    });

    it('should handle null lastName with N/A fallback', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          currentInterviewStep: 1,
          candidate: { id: 10, firstName: 'John', lastName: null },
          interviews: [],
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await getCandidatesInProcessByPosition(1);

      expect(result[0].fullName).toContain('John');
    });
  });

  describe('updateCandidateStage', () => {
    it('should return null when application not found', async () => {
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateCandidateStage(1, 1, 2);

      expect(result).toBeNull();
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: {
          candidateId: 1,
          positionId: 1,
        },
        orderBy: {
          applicationDate: 'desc',
        },
      });
    });

    it('should update candidate stage successfully', async () => {
      const mockApplication = {
        id: 1,
        candidateId: 1,
        positionId: 1,
        currentInterviewStep: 1,
      };

      const mockUpdatedApplication = {
        id: 1,
        candidateId: 1,
        positionId: 1,
        currentInterviewStep: 2,
        candidate: { id: 1, firstName: 'John', lastName: 'Doe' },
        position: { id: 1, title: 'Senior Dev' },
      };

      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(mockApplication);
      (mockPrisma.application.update as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      const result = await updateCandidateStage(1, 1, 2);

      expect(result).toEqual(mockUpdatedApplication);
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currentInterviewStep: 2 },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          position: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    });

    it('should update to latest application when multiple exist', async () => {
      const mockApplication = {
        id: 2,
        candidateId: 1,
        positionId: 1,
        currentInterviewStep: 1,
        applicationDate: new Date('2026-05-09'),
      };

      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(mockApplication);
      (mockPrisma.application.update as jest.Mock).mockResolvedValue({ ...mockApplication, currentInterviewStep: 3 });

      const result = await updateCandidateStage(1, 1, 3);

      expect(result?.currentInterviewStep).toBe(3);
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { applicationDate: 'desc' },
        })
      );
    });

    it('should reject invalid interview step with Prisma error', async () => {
      const mockApplication = { id: 1, candidateId: 1, positionId: 1 };

      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(mockApplication);
      (mockPrisma.application.update as jest.Mock).mockRejectedValue({
        code: 'P2003',
        message: 'Foreign key constraint failed on the field: `currentInterviewStep`',
      });

      try {
        await updateCandidateStage(1, 1, 999);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.code).toBe('P2003');
      }
    });
  });

  describe('assignInterviewScore', () => {
    it('should return null when application does not exist', async () => {
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await assignInterviewScore(1, 1, 80);

      expect(result).toBeNull();
    });

    it('should update existing interview score for current phase', async () => {
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue({
        id: 5,
        currentInterviewStep: 2,
        position: { companyId: 1 },
      });
      (mockPrisma.employee.findFirst as jest.Mock).mockResolvedValue({ id: 7 });
      (mockPrisma.interview.findFirst as jest.Mock).mockResolvedValue({ id: 9 });
      (mockPrisma.interview.update as jest.Mock).mockResolvedValue({ id: 9, score: 92 });

      const result = await assignInterviewScore(1, 1, 92);

      expect(result).toEqual({ id: 9, score: 92 });
      expect(mockPrisma.interview.update).toHaveBeenCalledWith({
        where: { id: 9 },
        data: {
          score: 92,
          result: 'Scored',
        },
      });
    });

    it('should create interview score when no interview exists for phase', async () => {
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue({
        id: 6,
        currentInterviewStep: 3,
        position: { companyId: 1 },
      });
      (mockPrisma.employee.findFirst as jest.Mock).mockResolvedValue({ id: 7 });
      (mockPrisma.interview.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.interview.aggregate as jest.Mock).mockResolvedValue({ _max: { id: 200 } });
      (mockPrisma.interview.create as jest.Mock).mockResolvedValue({ id: 10, score: 75 });

      const result = await assignInterviewScore(1, 1, 75);

      expect(result).toEqual({ id: 10, score: 75 });
      expect(mockPrisma.interview.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 201,
          applicationId: 6,
          interviewStepId: 3,
          employeeId: 7,
          score: 75,
          result: 'Scored',
        }),
      });
    });
  });
});
