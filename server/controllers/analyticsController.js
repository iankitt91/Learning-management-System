import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { CourseModel } from "../models/courseModel.js";
import { OrderModel } from "../models/orderModel.js";
import { UserModel } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { generateLast12MonthsData } from "../utils/generateAnalytics.js";


//get users alalytics (admin only)
export const getUsersAnalytics = apiErrorHandler( async (req,res,next) =>{
    try{
        const users = await generateLast12MonthsData(UserModel);

        res.status(200).json({
            success:true,
            users,
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});


//get courses alalytics (admin only)
export const getCoursesAnalytics = apiErrorHandler( async (req,res,next) =>{
    try{
        const courses = await generateLast12MonthsData(CourseModel);

        res.status(200).json({
            success:true,
            courses,
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});


//get courses alalytics (admin only)
export const getOrdersAnalytics = apiErrorHandler( async (req,res,next) =>{
    try{
        const orders = await generateLast12MonthsData(OrderModel);

        res.status(200).json({
            success:true,
            orders,
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});