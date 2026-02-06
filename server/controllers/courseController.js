import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { CourseModel } from "../models/courseModel.js";
import { createCourse } from "../services/courseService.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from 'cloudinary';
import { redis } from "../utils/redis.js";
import mongoose from 'mongoose';




export const uploadCourse = apiErrorHandler( async (req,res,next) =>{
    try{
        console.log("request received");
        const data = req.body;
        console.log(data);
        const thumbnail = data.thumbnail;
        if(thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:'courses'
            });
            data.thumbnail = {
                public_id:myCloud.public_id,
                url:myCloud.secure_url,
            }
        }
        const course = await createCourse(data); 
        res.status(201).json({
        success:true,
        message:'Course created successfully',
        course,
    });
    }catch(error){
        next(new ErrorHandler(500,error.message));
    }
});


//edit course
export const editCourse = apiErrorHandler( async (req,res,next) =>{
    try{
        const data = req.body;
        const thumbnail = data.thumbnail;
        if(thumbnail){
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:'courses',
            });
            data.thumbnail = {
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            }
        }

        const courseId = req.params.id;
        const course = await CourseModel.findByIdAndUpdate(courseId,{$set:data},{new:true});

        res.status(201).json({
            success:true,
            message:'Course updated successfully',
            course,
        });
    }catch(error){
        next(new ErrorHandler(500,error.message));
    }
});


//get single course (for unpurchased user)
export const getSingleCourse = apiErrorHandler( async (req,res,next) =>{
    try{
        const courseId = req.params.id;
        const isCacheExist = await redis.get(courseId);
        if(isCacheExist){
            const course = JSON.parse(isCacheExist);
            // console.log('redis');
            res.status(200).json({
                success:true,
                course,
            });
        }else{
            const course  = await CourseModel.findById(courseId).select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links');

            await redis.set(courseId,JSON.stringify(course));

            // console.log('mongodb');

            res.status(200).json({
                success:true,
                course,
            });
        }
    }catch(error){
        next(new ErrorHandler(500,error.message));
    }
});


//get courses (for unpurchased users)

export const getAllCourses = apiErrorHandler( async (req,res,next) =>{
    try{

        const isCacheExist = await redis.get('allCourses');
        if(isCacheExist){
            const courses = JSON.parse(isCacheExist);

            // console.log('hitting redis');

            res.status(200).json({
                success:true,
                courses,
            });
        }else{
            const courses = await CourseModel.find().select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links');

            await redis.set('allCourses',JSON.stringify(courses));

            // console.log('hitting mongodb');

            res.status(200).json({
                success:true,
                courses,
            });
        }
    }catch(error){
        next(new ErrorHandler(500,error.message));
    }
});


//get course (for purchased users)
export const getCourseByUser = apiErrorHandler( async (req,res,next) =>{
    try{
        const courseId = req.params.id;
        const userCourseList = req.user?.courses;
        const isCoursePurchased = userCourseList?.find((course) => course._id === courseId);
        if(!isCoursePurchased){
            return next(new ErrorHandler(404,'Purchase this course to access resources'));
        }
        const course = await CourseModel.findById(courseId);
        const content = course?.courseData;
        res.status(200).json({
            success:true,
            content,
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});


//add questions
export const addQuestion = apiErrorHandler( async (req,res,next) =>{
    try{
        const {question,courseId,contentId} = req.body;
        console.log(contentId);

        const course = await CourseModel.findById(courseId);
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler(400,'Invalid content id'));
        }

        const courseContent = course?.courseData?.find((item) => item._id.toString() === contentId);
        if(!courseContent){
            return next(new ErrorHandler(400,'Invalid content id'));
        }

        const newQuestion = {
            user:req.user,
            question,
            questionReplies:[],
        }

        courseContent.questions.push(newQuestion);
        await course.save();

        res.status(201).json({
            success:true,
            course,
        });
    }catch(error){
        return next(new ErrorHandler(505,error.message));
    }
});


//repies question
export const addAnswer = apiErrorHandler( async (req,res,next) =>{
    try{
        const {answer,courseId,contentId,questionId} = req.body;

        const course = await CourseModel.findById(courseId);
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler(400,'Invalid content id'));
        }

        const courseContent = course?.courseData?.find((item) => item._id.toString() === contentId);
        if(!courseContent){
            return next(new ErrorHandler(400,'Invalid content id'));
        }

        const question = courseContent?.questions?.find((item) => item._id.toString() === questionId);
        if(!question){
            return next(new ErrorHandler(400,'Question not found'));
        }

        const reply = {
            answer,
            user:req.user,
        }

        question.questionReplies.push(reply);

        await course.save();
        if(req.user._id === question.user._id){
            //create notification
        }else{
            const data = {
                name:question.user.name,
                title:courseContent.title,
            }

            try{
                await sendMail(question.user.email,'Question Replies',data,'questionReply.ejs');
            }catch(error){
                return next(new ErrorHandler(400,"Error sending replies to question email"));
            }
        }
        res.status(201).json({
            success:true,
            course,
        });
    }catch(error){
        return next(new ErrorHandler(505,error.message));
    }
});


//add review
export const addReview = apiErrorHandler( async (req,res,next) =>{
    try{
        const userCourseList = req?.user?.courses;
        const courseId = req.params.id;
        const courseExist = userCourseList?.some((item) => item._id.toString() === courseId.toString());
        if(!courseExist){
            return next(new ErrorHandler(400,'You are not authorized to review this course'));
        }

        const {review,rating} = req.body;
        const course = await CourseModel.findById(courseId);
        const newReview = {
            user:req.user,
            rating:rating,
            comment:review,
        }
        course.reviews.push(newReview);

        let avg = 0;
        course?.reviews.forEach((rev) =>{
            avg+=rev.rating;
        });
        if(course){
            course.ratings = avg/course.reviews.length;
        }
        await course?.save();

        const notification = {
            title:'New Review Received',
            message:`${req?.user?.name} has given a review on your course ${course?.name}.`,
        }
        //create notification later

        res.status(201).json({
            success:true,
            course,
        });
    }catch(error){
        return next(new ErrorHandler(500,error.message));
    }
});


//add reply to review
export const reviewReply = apiErrorHandler( async (req,res,next) =>{
    try{
        const {comment,courseId,reviewId} = req.body;
        const course = await CourseModel.findById(courseId);
        if(!course){
            return next( new ErrorHandler(404,'Course does not exist'));
        }

        const review = course.reviews.find((item) => item._id.toString() === reviewId);
        if(!review){
            return next( new ErrorHandler(404,'Review does not exist'));
        }

        const reviewReply = {
            user:req?.user,
            comment,
        }

        if(!review.commentReplies){
            review.commentReplies = [];
        }

        review?.commentReplies?.push(reviewReply);
        await course.save();

        res.status(201).json({
            success:true,
            course,
        });
    }catch(error){
        return next( new ErrorHandler(500,error.message));
    }
});