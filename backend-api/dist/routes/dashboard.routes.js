import { Router } from 'express';
import { handleGetOrgAnalytics, handleGetFactoryAnalytics } from '../controllers/dashboard.controller.js';
import { authorize } from '../middleware/auth.middleware.js';
const router = Router();
// This endpoint is for Organization Admins ONLY.
// We apply the authorize middleware directly in the route definition.
router.get('/org-analytics', authorize('ORG_ADMIN'), handleGetOrgAnalytics);
// This endpoint is for both Factory Managers and Organization Admins.
router.get('/factory-analytics', authorize('FACTORY_MANAGER', 'ORG_ADMIN'), handleGetFactoryAnalytics);
export default router;
//# sourceMappingURL=dashboard.routes.js.map