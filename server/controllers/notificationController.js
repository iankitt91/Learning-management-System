import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { NotificationModel } from "../models/notificationModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cron from 'node-cron';



//get all notifications (for admin only)
export const getNotifications = apiErrorHandler( async (req,res,next) =>{
    try{
        const notifiactions = await NotificationModel.find().sort({createdAt:-1});

        res.status(200).json({
            success:true,
            notifiactions,
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//update notification status (for admin only)
export const updateNotification = apiErrorHandler( async (req, res, next) =>{
    try {
        const notificationId = req.params.id;
        const notification = await NotificationModel.findByIdAndUpdate(notificationId,{ status: 'read' },{ new: true });

        if(!notification){
            return next(new ErrorHandler(400, 'Notification does not exist'));
        }

        const notifications = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    }catch(error){
        return next(new ErrorHandler(400, error.message));
    }
});


//A cron job is an automated task that runs on a schedule. Think of it like an alarm clock for your server.
//It’s handled by a background service called cron, and you define jobs using a special time format.
//delete notification usong cron job approach (node cron);
//this runs every midnight and delete notification which is read and created before 30 days
cron.schedule('0 0 0 * * *', async () =>{
    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);

    await NotificationModel.deleteMany({status:'read',createdAt:{$lt:thirtyDaysAgo}});
});
