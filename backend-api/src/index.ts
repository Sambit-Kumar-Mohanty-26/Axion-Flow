import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authorize, protect, type AuthRequest } from './middleware/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import activationRoutes from './routes/activation.routes.js';
import factoryRoutes from './routes/factory.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import skillRoutes from './routes/skill.routes.js';
import workerRoutes from './routes/worker.routes.js';
import taskRoutes from './routes/task.routes.js';
import inviteRoutes from './routes/invite.routes.js'; 
import publicInviteRoutes from './routes/publicInvite.routes.js'; 
import { startDataFeeder } from './utils/data-feeder.js';

const app = express();
const PORT = 10000; 
const httpServer = createServer(app);

const allowedOrigins = [
    'http://localhost:5173',
    'https://axion-flow.vercel.app' 
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
app.use(cors(corsOptions));
const io = new Server(httpServer, {
  cors: corsOptions
});
export { io };

import type { Socket } from 'socket.io';

io.on('connection', (socket: Socket) => {
  console.log(`⚡️ Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔥 Client disconnected: ${socket.id}`);
  });
});
app.use(express.json());
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/activation', activationRoutes);
apiRouter.use('/invites', publicInviteRoutes); 
apiRouter.get('/health', (req, res) => { res.status(200).json({ status: 'UP' }); });
apiRouter.use(protect);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/skills', skillRoutes);
apiRouter.use('/tasks', protect, taskRoutes);
apiRouter.use('/factories', protect, factoryRoutes);
apiRouter.use('/users', authorize('ORG_ADMIN'), userRoutes);
apiRouter.use('/workers', authorize('ORG_ADMIN', 'FACTORY_MANAGER'), workerRoutes);
apiRouter.use('/invites', authorize('ORG_ADMIN', 'FACTORY_MANAGER'), inviteRoutes); 
app.use('/api', apiRouter);
console.log("--- DEBUGGING RENDER ENVIRONMENT ---");
Object.keys(process.env).forEach(key => {
  if (key.includes('AXION') || key.includes('SERVICE') || key.includes('HOST')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  startDataFeeder();
});
