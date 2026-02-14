import express from 'express';
import { getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from '../controllers/analyticsController.js';
import { authenticateRole, isAuthenticated } from '../middleware/authentictedUser.js';

const analyticsRouter = express.Router();


analyticsRouter.get('/get-users-analytics',isAuthenticated,authenticateRole('admin'),getUsersAnalytics);
analyticsRouter.get('/get-courses-analytics',isAuthenticated,authenticateRole('admin'),getCoursesAnalytics);
analyticsRouter.get('/get-orders-analytics',isAuthenticated,authenticateRole('admin'),getOrdersAnalytics);


export default analyticsRouter;