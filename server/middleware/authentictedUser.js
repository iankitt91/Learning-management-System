import dotenv from 'dotenv';
dotenv.config();
import ErrorHandler from "../utils/errorHandler.js";
import { redis } from "../utils/redis.js";
import apiErrorHandler from "./apiErrorHandler.js";
import jwt from 'jsonwebtoken';


//authenticated user middleware
export const isAuthenticated = apiErrorHandler( async (req,res,next) =>{
    const access_token = req.cookies.access_token;
    if(!access_token){
        return next(new ErrorHandler(400,'Please login to access resources'));
    }

    const decode = jwt.verify(access_token,process.env.ACCESS_TOKEN);
    if(!decode){
        return next(new ErrorHandler(400,'Invalid access token'));
    }

    const user = await redis.get(decode.id);
    if(!user){
        return next(new ErrorHandler(400,'User does not exist'));
    }

    req.user = JSON.parse(user); 
    next();
});


//authenticate user roles
export const authenticateRole = (...roles) => (req,res,next) =>{
    if(!roles.includes(req.user?.role || '')){
        return next(new ErrorHandler(403,`Unauthorized access: role ${req.user?.role} is not allowed to access this resources`));
    }
    next(); 
}