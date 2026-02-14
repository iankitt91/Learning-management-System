import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { CourseModel } from "../models/courseModel.js";
import { NotificationModel } from "../models/notificationModel.js";
import { OrderModel } from "../models/orderModel.js";
import { UserModel } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendMail } from "../utils/sendEmail.js";



//create order
export const createOrder = apiErrorHandler( async (req,res,next) =>{
    try{
        const {courseId,payment_info} = req.body;
        const user = await UserModel.findById(req?.user?._id);

        const isCourseAlreadyPurchased = user.courses.some((item) => item?._id.toString() === courseId);

        if(isCourseAlreadyPurchased){
            return next(new ErrorHandler(400,'Already purchased this course'));
        }

        const course = await CourseModel.findById(courseId);
        if(!course){
            return next(new ErrorHandler(404,'Course does not exist'));
        }

        const data = {
            courseId:course._id,
            userId:user._id,
            payment_info,
        }

        const order = await OrderModel.create(data);

        const mailData = {
            order:{
                _id:course._id,
                name:course.name,
                price:course.price,
                date:new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),
            }
        }
        try{
            if(user){
                await sendMail(user.email,'Order confirmation mail',mailData,'orderConfirmation.ejs');
            }
        }catch(error){
            return next(new ErrorHandler(500,'Error sending confirmation mail'));
        }

        user?.courses?.push(course?._id);
        await user?.save();

        await NotificationModel.create({
            userId:user?._id,
            title:'New order',
            message:`You received a new order of ${course?.name}`,
        });

        course.purchased += 1;
        await course.save();

        res.status(201).json({
            success:true,
            order,
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//get all orders (admin only)
export const getAllOrdersAdmin = apiErrorHandler( async (req,res,next) =>{
    try{
        const orders = await OrderModel.find().sort({createdAt:-1});

        res.status(200).json({
            success:true,
            orders,
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});