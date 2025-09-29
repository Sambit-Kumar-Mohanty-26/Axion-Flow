import express from 'express';
import cors from 'cors';
import skillRoutes from './routes/skill.routes.js';
import workerRoutes from './routes/worker.routes.js';
import taskRoutes from './routes/task.routes.js'; 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.use('/api/skills', skillRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});