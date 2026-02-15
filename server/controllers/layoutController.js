import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { LayoutModel } from "../models/layoutModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary';
import { addAnswer } from "./courseController.js";


//create layout
export const createLayout = apiErrorHandler( async (req,res,next) =>{
    try{
        const {type} = req.body;
        const isTypeExist = await LayoutModel.findOne({type});
        if(isTypeExist){
            return next(new ErrorHandler(400,`${type} already exist`));
        }
        if(type === 'Banner'){
            const {image,title,subTitle} = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:'layout'
            });
            const banner = {
                image:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                },
                title,
                subTitle,
            }
            await LayoutModel.create(banner);
        }

        if(type === 'Faq'){
            const {faq} = req.body;
            const faqItems = await Promise.all(
                faq.map( async (item) =>{
                    return{
                        question:item.question,
                        answer:item.answer,
                    }
                })
            )
            await LayoutModel.create({type:'Faq',faq:faqItems});
        }

        if(type === 'Categories'){
            const {categories} = req.body;
            const categoriesItems = await Promise.all(
                categories.map( async (item) =>{
                    return{
                        title:item.title,
                    }
                })
            )
            await LayoutModel.create({type:'Categories',categories:categoriesItems});
        }

        res.status(200).json({
            success:true,
            message:'Layout created successfully',
        })
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});


//update layout
export const updateLayout = apiErrorHandler( async (req,res,next) =>{
    try{
        const {type} = req.body;

        if(type === 'Banner'){
            const {image,title,subTitle} = req.body;

            const bannerData = await LayoutModel.findOne({type:'Banner'});
            if(bannerData){
                await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
            }
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:'layout'
            });
            const banner = {
                image:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                },
                title,
                subTitle,
            }
            await LayoutModel.findByIdAndUpdate(bannerData?._id,{banner});
        }

        if(type === 'Faq'){
            const {faq} = req.body;
            const faqData = await LayoutModel.findOne({type:'Faq'});
            const faqItems = await Promise.all(
                faq.map( async (item) =>{
                    return{
                        question:item.question,
                        answer:item.answer,
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(faqData?._id,{type:'Faq',faq:faqItems});
        }

        if(type === 'Categories'){
            const {categories} = req.body;
            const categoriesData = await LayoutModel.findOne({type:'Categories'});
            const categoriesItems = await Promise.all(
                categories.map( async (item) =>{
                    return{
                        title:item.title,
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(categoriesData?._id,{type:'Categories',categories:categoriesItems});
        }

        res.status(200).json({
            success:true,
            message:'Layout updated successfully',
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});


//get layout by type
export const getLayoutByType = apiErrorHandler( async (req,res,next) =>{
    try{
        const {type} = req.body;
        const layout = await LayoutModel.findOne({type});
        if(!layout){
            return next(new ErrorHandler(400,'Layout of this type does not exist'));
        }

        res.status(200).json({
            success:true,
            layout,
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});