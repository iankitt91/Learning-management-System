import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/commonError.js';
import userRouter from './routes/userRouter.js';
import courseRouter from './routes/courseRouter.js';
import orderRouter from './routes/orderRouter.js';



const app = express();
dotenv.config({
    path:'/.env',
})

app.use(express.json({limit:'50mb'}));
app.use(cookieParser({limit:'50mb'}));
app.use(cors({
    origin:process.env.CORS_ORIGIN,
}));


//routes
app.use('/api/v1',userRouter);
app.use('/api/v1/',courseRouter);



//tesing api
app.get('/test',(req,res) =>{
    res.status(200).json({
        success:true,
        message:'api is working'
    });
});



//404 api handler
app.use((req,res,next) =>{
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});

app.use(errorMiddleware);




export default app;