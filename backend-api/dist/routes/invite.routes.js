// src/routes/invite.routes.ts
import { Router } from 'express';
import { handleCreateInvite, handleVerifyInvite, handleAcceptInvite } from '../controllers/invite.controller.js';
const router = Router();
// The routes for verifying and accepting are public, anyone with the link can access.
router.get('/verify/:token', handleVerifyInvite);
router.post('/accept', handleAcceptInvite);
// The route for creating an invitation is protected.
// We will apply the security middleware in index.ts
router.post('/', handleCreateInvite);
export default router;
//# sourceMappingURL=invite.routes.js.map