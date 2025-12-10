import { Router } from 'express';
import { handleGetUsers, handleDeleteUser, handleUpdateRole } from '../controllers/user.controller.js';

const router = Router();

router.get('/', handleGetUsers);
router.delete('/:id', handleDeleteUser);
router.patch('/:id/role', handleUpdateRole); 

export default router;