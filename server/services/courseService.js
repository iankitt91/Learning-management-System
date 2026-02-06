import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { CourseModel } from "../models/courseModel.js";


export const createCourse = async (data) =>{
    return await CourseModel.create(data);
};