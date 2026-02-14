import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({
    title:{
        type:String,
        reuired:true,
    },
    message:{
        type:String,
        reuired:true,
    },
    status:{
        type:String,
        default:'unread',
    },
    userId:{
        type:String,
        required:true,
    }
},{timestamps:true});

export const NotificationModel = mongoose.model('notification',notificationSchema);