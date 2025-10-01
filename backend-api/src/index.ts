import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; 
import { Server } from 'socket.io';
import skillRoutes from './routes/skill.routes.js';
import workerRoutes from './routes/worker.routes.js';
import taskRoutes from './routes/task.routes.js'; 
import authRoutes from './routes/auth.routes.js';
import { authorize, protect } from './middleware/auth.middleware.js';
import factoryRoutes from './routes/factory.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import activationRoutes from './routes/activation.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

export { io };

io.on('connection', (socket) => {
  console.log(`⚡️ Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔥 Client disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/activation', activationRoutes);
app.get('/api/health', protect, (req, res) => {
  res.status(200).json({ status: 'UP' });
});
app.use('/api/factories', protect, authorize('ORG_ADMIN'), factoryRoutes);
app.use('/api/invites', (req, res, next) => {
    if (req.method === 'POST' && req.path === '/') {
        return protect(req, res, () => authorize('ORG_ADMIN', 'FACTORY_MANAGER')(req, res, next));
    }
    next();
}, inviteRoutes);

app.use('/api/skills', protect, skillRoutes);
app.use('/api/workers', protect, authorize('ORG_ADMIN', 'FACTORY_MANAGER'), workerRoutes);
app.use('/api/tasks', protect, taskRoutes);
app.use('/api/users', protect, authorize('ORG_ADMIN'), userRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});