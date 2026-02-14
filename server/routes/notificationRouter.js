import express from 'express';
import { getNotifications, updateNotification } from '../controllers/notificationController.js';
import { authenticateRole, isAuthenticated } from '../middleware/authentictedUser.js';

const notificationRouter = express.Router();


notificationRouter.get('/all-notifiactions',isAuthenticated,authenticateRole('admin'),getNotifications);
notificationRouter.put('/update-notification/:id',isAuthenticated,authenticateRole('admin'),updateNotification);

export default notificationRouter;