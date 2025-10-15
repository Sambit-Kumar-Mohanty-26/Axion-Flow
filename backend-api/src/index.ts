import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; 
import { Server } from 'socket.io';

// Import all your route handlers and middleware
import skillRoutes from './routes/skill.routes.js';
import workerRoutes from './routes/worker.routes.js';
import taskRoutes from './routes/task.routes.js'; 
import authRoutes from './routes/auth.routes.js';
import { authorize, protect, type AuthRequest } from './middleware/auth.middleware.js';
import factoryRoutes from './routes/factory.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import activationRoutes from './routes/activation.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
const PORT = 10000;
const httpServer = createServer(app);

const allowedOrigins = [
    'http://localhost:5173',         
    'https://axion-flow.vercel.app', 
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions)); 
app.use(express.json());

const io = new Server(httpServer, {
  cors: corsOptions 
});
export { io };

io.on('connection', (socket) => {
  console.log(`⚡️ Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔥 Client disconnected: ${socket.id}`);
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/activation', activationRoutes);
app.get('/api/health', protect, (req: AuthRequest, res) => {
  res.status(200).json({ status: 'UP', user: req.user });
});

app.use('/api/factories', protect, authorize('ORG_ADMIN'), factoryRoutes);
app.use('/api/users', protect, authorize('ORG_ADMIN'), userRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/skills', protect, skillRoutes);
app.use('/api/workers', protect, authorize('ORG_ADMIN', 'FACTORY_MANAGER'), workerRoutes);
app.use('/api/tasks', protect, taskRoutes);

app.use('/api/invites', (req, res, next) => {
    if (req.method === 'POST' && req.path === '/') {
        return protect(req as AuthRequest, res, () => authorize('ORG_ADMIN', 'FACTORY_MANAGER')(req as AuthRequest, res, next));
    }
    next();
}, inviteRoutes);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
