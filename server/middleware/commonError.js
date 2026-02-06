import ErrorHandler from "../utils/errorHandler.js";

export const errorMiddleware = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';

    //wrong mongodb_id (castError)
    if(err.name === 'CastError'){
        const message = `Resources not found. Invalid ${err.path}`;
        err = new ErrorHandler(400,message);
    }

    //duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(400,message);
    }

    //wrong jwt invalid token error
    if(err.name === 'JsonWebTokenError'){
        const message = `Invalid token, try again`;
        err = new ErrorHandler(400,message);
    }

    //jwt expired token
    if(err.name === 'TokenExpiredError'){
        const message = `Token is expired, try again`;
        err = new ErrorHandler(400,message);
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    });
}