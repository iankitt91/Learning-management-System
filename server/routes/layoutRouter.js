import express from 'express';
import { createLayout, getLayoutByType, updateLayout } from '../controllers/layoutController.js';
import { authenticateRole, isAuthenticated } from '../middleware/authentictedUser.js';

const layoutRouter = express.Router();

layoutRouter.post('/create-layout',isAuthenticated,authenticateRole('admin'),createLayout);
layoutRouter.put('/update-layout',isAuthenticated,authenticateRole('admin'),updateLayout);
layoutRouter.get('/get-layout',getLayoutByType);

export default layoutRouter;