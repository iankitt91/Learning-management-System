import express from 'express';
import { createOrder, getAllOrdersAdmin } from '../controllers/orderController.js';
import { authenticateRole, isAuthenticated } from '../middleware/authentictedUser.js';

const orderRouter = express.Router();


orderRouter.post('/create-order',isAuthenticated,createOrder);
orderRouter.get('/get-all-orders',isAuthenticated,authenticateRole('admin'),getAllOrdersAdmin);

export default orderRouter;