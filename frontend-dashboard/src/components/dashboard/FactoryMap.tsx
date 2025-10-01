import { WorkerAvatar } from './WorkerAvatar';

interface FactoryMapProps {
  workers: any[]; 
  isLoading: boolean;
}

export const FactoryMap = ({ workers, isLoading }: FactoryMapProps) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Loading Map Data...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900/50 rounded-lg border-2 border-dashed border-white/10 overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {workers.map(worker => (
        <WorkerAvatar key={worker.id} worker={worker} />
      ))}
    </div>
  );
};