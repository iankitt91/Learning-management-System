import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
    courseId:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        reuired:true,
    },
    payment_info:{
        type:Object,
        // required:true,
    },

},{timestamps:true});

export const OrderModel = mongoose.model('order',orderSchema);