import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes';
import positionRoutes from './routes/positionRoutes';
import { uploadFile } from './application/services/fileUploadService';
import cors from 'cors';
import path from 'path';

// Extender la interfaz Request para incluir prisma
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
}

if (!process.env.DATABASE_URL && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME && process.env.DB_PORT) {
  process.env.DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

const prisma = new PrismaClient();

export const app = express();
export default app;

// Middleware para parsear JSON. Asegúrate de que esto esté antes de tus rutas.
app.use(express.json());

// Middleware para adjuntar prisma al objeto de solicitud
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Middleware para permitir CORS desde http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Import and use candidateRoutes
app.use('/candidates', candidateRoutes);
app.use('/positions', positionRoutes);

// Route for file uploads
app.post('/upload', uploadFile);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const port = 3010;

app.get('/', (req, res) => {
  res.status(204).send();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain'); 
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
