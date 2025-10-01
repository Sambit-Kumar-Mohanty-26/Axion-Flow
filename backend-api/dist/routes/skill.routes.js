import { Router } from 'express';
import { handleCreateSkill, handleGetAllSkills } from '../controllers/skill.controller.js';
const router = Router();
router.get('/', handleGetAllSkills);
router.post('/', handleCreateSkill);
export default router;
//# sourceMappingURL=skill.routes.js.map