import { Router } from 'express';
import { 
  handleGetOrgAnalytics, 
  handleGetFactoryAnalytics 
} from '../controllers/dashboard.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get(
  '/org-analytics', 
  authorize('ORG_ADMIN'), 
  handleGetOrgAnalytics
);

router.get(
  '/factory-analytics', 
  authorize('FACTORY_MANAGER', 'ORG_ADMIN'), 
  handleGetFactoryAnalytics
);

export default router;