import PF from 'pathfinding';

const GRID_SIZE = 100;

export const createGridFromLayout = (layout: any[]): PF.Grid => {
  const matrix = new Array(GRID_SIZE).fill(0).map(() => new Array(GRID_SIZE).fill(0));

  if (Array.isArray(layout)) {
    layout.forEach((obs: any) => {
      const x = Math.floor(Math.max(0, Math.min(obs.x, 99)));
      const y = Math.floor(Math.max(0, Math.min(obs.y, 99)));
      const w = Math.floor(obs.w);
      const h = Math.floor(obs.h);

      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) {
            matrix[j][i] = 1;
          }
        }
      }
    });
  }

  return new PF.Grid(matrix);
};

export const getPathFinder = () => {
    return new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
    });
};

export const calculateAStarDistance = (
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  grid: PF.Grid
): number => {
  const gridClone = grid.clone();
  const finder = getPathFinder();
  
  const sX = Math.floor(Math.max(0, Math.min(startX, 99)));
  const sY = Math.floor(Math.max(0, Math.min(startY, 99)));
  const eX = Math.floor(Math.max(0, Math.min(endX, 99)));
  const eY = Math.floor(Math.max(0, Math.min(endY, 99)));

  if (!grid.isWalkableAt(sX, sY) || !grid.isWalkableAt(eX, eY)) {
      return Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
  }

  const path = finder.findPath(sX, sY, eX, eY, gridClone);

  if (path.length === 0 && (sX !== eX || sY !== eY)) return 999;
  
  return path.length;
};