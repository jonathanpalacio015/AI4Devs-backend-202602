import { Router } from 'express';
import { getCandidatesByPositionController } from '../presentation/controllers/candidateController';

const router = Router();

router.get('/:id/candidates', getCandidatesByPositionController);

export default router;
