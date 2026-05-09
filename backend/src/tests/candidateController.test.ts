import { Request, Response } from 'express';
import {
  getCandidatesByPositionController,
  updateCandidateScoreController,
  updateCandidateStageController,
} from '../../src/presentation/controllers/candidateController';
import * as candidateService from '../../src/application/services/candidateService';

jest.mock('../../src/application/services/candidateService');

const mockCandidateService = candidateService as jest.Mocked<typeof candidateService>;

describe('Candidate Controller - Kanban Endpoints', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('getCandidatesByPositionController', () => {
    it('should return 200 with candidates list for valid position ID', async () => {
      const mockCandidates = [
        {
          applicationId: 1,
          candidateId: 10,
          fullName: 'John Doe',
          current_interview_step: 2,
          averageScore: 85,
          average_score: 85,
        },
      ];

      mockReq.params = { id: '1' };
      mockCandidateService.getCandidatesInProcessByPosition.mockResolvedValue(mockCandidates);

      await getCandidatesByPositionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCandidates);
    });

    it('should return 400 when position ID is not a valid number', async () => {
      mockReq.params = { id: 'abc' };

      await getCandidatesByPositionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
    });

    it('should return 200 with empty array when position has no candidates', async () => {
      mockReq.params = { id: '999' };
      mockCandidateService.getCandidatesInProcessByPosition.mockResolvedValue([]);

      await getCandidatesByPositionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on service error', async () => {
      mockReq.params = { id: '1' };
      mockCandidateService.getCandidatesInProcessByPosition.mockRejectedValue(new Error('DB Error'));

      await getCandidatesByPositionController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('updateCandidateStageController', () => {
    it('should return 200 when stage updated successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, currentInterviewStep: 2 };

      const mockUpdatedApp = {
        id: 1,
        candidateId: 1,
        positionId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date(),
        notes: null,
        candidate: { id: 1, firstName: 'John', lastName: 'Doe' },
        position: { id: 1, title: 'Senior Dev' },
      };

      mockCandidateService.updateCandidateStage.mockResolvedValue(mockUpdatedApp);

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate stage updated successfully',
        data: mockUpdatedApp,
      });
    });

    it('should return 400 when candidate ID is not a valid number', async () => {
      mockReq.params = { id: 'abc' };
      mockReq.body = { positionId: 1, currentInterviewStep: 2 };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid candidate ID format' });
    });

    it('should return 400 when positionId is missing', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { currentInterviewStep: 2 };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'positionId and currentInterviewStep must be numbers',
      });
    });

    it('should return 400 when currentInterviewStep is missing', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1 };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'positionId and currentInterviewStep must be numbers',
      });
    });

    it('should return 400 when positionId is not a number', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 'abc', currentInterviewStep: 2 };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'positionId and currentInterviewStep must be numbers',
      });
    });

    it('should return 400 when currentInterviewStep is not a number', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, currentInterviewStep: 'abc' };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'positionId and currentInterviewStep must be numbers',
      });
    });

    it('should return 404 when application not found', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, currentInterviewStep: 2 };

      mockCandidateService.updateCandidateStage.mockResolvedValue(null);

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Application not found for the candidate and position',
      });
    });

    it('should return 400 when invalid interview step ID (FK constraint)', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, currentInterviewStep: 999 };

      const error: any = new Error('Foreign key constraint failed');
      error.code = 'P2003';

      mockCandidateService.updateCandidateStage.mockRejectedValue(error);

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid currentInterviewStep. Interview step does not exist',
      });
    });

    it('should return 500 on unexpected service error', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, currentInterviewStep: 2 };

      mockCandidateService.updateCandidateStage.mockRejectedValue(new Error('Unexpected DB error'));

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('updateCandidateScoreController', () => {
    it('should return 200 when score updated successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, score: 90 };

      const mockUpdatedInterview = {
        id: 1,
        applicationId: 1,
        interviewStepId: 2,
        employeeId: 1,
        score: 90,
      };

      mockCandidateService.assignInterviewScore.mockResolvedValue(mockUpdatedInterview as any);

      await updateCandidateScoreController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate interview score updated successfully',
        data: mockUpdatedInterview,
      });
    });

    it('should return 400 when score is out of range', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, score: 120 };

      await updateCandidateScoreController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'score must be between 0 and 100',
      });
    });

    it('should return 404 when application not found for scoring', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { positionId: 1, score: 80 };

      mockCandidateService.assignInterviewScore.mockResolvedValue(null);

      await updateCandidateScoreController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Application not found for the candidate and position',
      });
    });
  });
});
