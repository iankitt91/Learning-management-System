import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import { isAuthenticated } from '../middleware/authentictedUser.js';

const orderRouter = express.Router();


orderRouter.post('/create-order',isAuthenticated,createOrder);

export default orderRouter;