import mongoose from 'mongoose';


const faqSchema = new mongoose.Schema({
    question:String,
    answer:String,
});


const categorySchema = new mongoose.Schema({
    title:String,
});


const bannerSchema = new mongoose.Schema({
    public_id:String,
    url:String,
});


const layoutSchema = new mongoose.Schema({
    type:{
        type:String,
        enum:['Banner','Faq','Categories'],
    },
    faq:[faqSchema],
    categories:[categorySchema],
    banner:{
        image:bannerSchema,
        title:String,
        subTitle:String,
    },
});


export const LayoutModel = mongoose.model('layout',layoutSchema);