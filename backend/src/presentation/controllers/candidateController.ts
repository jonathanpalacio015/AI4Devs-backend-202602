import { Request, Response } from 'express';
import {
    addCandidate,
    assignInterviewScore,
    findCandidateById,
    getCandidatesInProcessByPosition,
    updateCandidateStage,
} from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id, 10);

        if (isNaN(positionId)) {
            return res.status(400).json({ error: 'Invalid position ID format' });
        }

        const candidates = await getCandidatesInProcessByPosition(positionId);
        return res.status(200).json(candidates);
    } catch (error) {
        console.error('getCandidatesByPositionController error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id, 10);
        const { positionId, currentInterviewStep } = req.body;

        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID format' });
        }

        if (typeof positionId !== 'number' || typeof currentInterviewStep !== 'number') {
            return res.status(400).json({
                error: 'positionId and currentInterviewStep must be numbers',
            });
        }

        const updatedApplication = await updateCandidateStage(candidateId, positionId, currentInterviewStep);

        if (!updatedApplication) {
            return res.status(404).json({
                error: 'Application not found for the candidate and position',
            });
        }

        return res.status(200).json({
            message: 'Candidate stage updated successfully',
            data: updatedApplication,
        });
    } catch (error: any) {
        console.error('updateCandidateStageController error:', error);
        if (error?.code === 'P2003') {
            return res.status(400).json({
                error: 'Invalid currentInterviewStep. Interview step does not exist',
            });
        }

        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateCandidateScoreController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id, 10);
        const { positionId, score } = req.body;

        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID format' });
        }

        if (typeof positionId !== 'number' || typeof score !== 'number') {
            return res.status(400).json({
                error: 'positionId and score must be numbers',
            });
        }

        if (score < 0 || score > 100) {
            return res.status(400).json({
                error: 'score must be between 0 and 100',
            });
        }

        const updatedInterview = await assignInterviewScore(candidateId, positionId, score);

        if (!updatedInterview) {
            return res.status(404).json({
                error: 'Application not found for the candidate and position',
            });
        }

        return res.status(200).json({
            message: 'Candidate interview score updated successfully',
            data: updatedInterview,
        });
    } catch (error: any) {
        console.error('updateCandidateScoreController error:', error);
        if (error?.code === 'NO_ACTIVE_EMPLOYEE') {
            return res.status(400).json({
                error: 'No active interviewer available for this company',
            });
        }

        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { addCandidate };