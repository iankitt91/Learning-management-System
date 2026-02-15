import ErrorHandler from "../utils/errorHandler.js";
import apiErrorHandler from "../middleware/apiErrorHandler.js";
import { UserModel } from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendEmail.js';
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt.js";
import { redis } from "../utils/redis.js";
import { getUserById } from "../services/getUser.js";
import cloudinary from 'cloudinary';


//helper function for creating activation token
const createActivationToken = (user) =>{
    const activationCode = Math.floor(1000+Math.random()*9000).toString();
    const token = jwt.sign({user,activationCode},process.env.JWT_SECRET,{
        expiresIn:'10m',
    });
    return {activationCode,token};
}

//register user controller
export const registerUser = apiErrorHandler( async (req,res,next) =>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return next(new ErrorHandler(400,"All fields are required"));
    }

    const isUserExist = await UserModel.findOne({email});
    if(isUserExist){
        return next(new ErrorHandler(400,"User already exist"));
    }

    const user = {
        name,
        email,
        password
    };
    const {activationCode,token} = createActivationToken(user);

    //mail acctivation code
    const data = {user:{name:user.name},activationCode}
    try{
        await sendMail(user.email,'Account acctivation email',data,'accountActivation.ejs');
        res.status(201).json({
            success:true,
            message:`Please check your email ${user.email} for account acctivation code`,
            token
        });
    }catch(error){
        return next(new ErrorHandler(400,"Error sending account acctivation email"));
    }
});


//activate user controller
export const activateUser = apiErrorHandler( async (req,res,next) =>{
    try{
        const {activation_code,activation_token} = req.body;
        const userData = jwt.verify(activation_token,process.env.JWT_SECRET);

        if(activation_code!==userData.activationCode){
            return next(new ErrorHandler(400,"Invalid activation code"));
        }

        const {name,email,password} = userData.user;

        const isUserExist = await UserModel.findOne({email});
        if(isUserExist){
            return next(new ErrorHandler(400,"User already exist"));
        }

        const user = await UserModel.create({
            name,
            email,
            password,
        });

        res.status(200).json({success:true,message:"Account created succesfully"});
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//login user controller
export const loginUser = apiErrorHandler( async (req,res,next) =>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return next(new ErrorHandler(400,"Please enter email and password"));
        }

        const user = await UserModel.findOne({email}).select('+password');
        if(!user){
            return next(new ErrorHandler(400,"User does not exist"));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if(!isPasswordMatched){
            return next(new ErrorHandler(400,"Invalid credientials"));
        }

        sendToken(user,200,res);
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});

//logout user controller
export const logoutUser = apiErrorHandler( async (req,res,next) =>{
    try{
        res.cookie('access_token','',{maxAge:1});
        res.cookie('refresh_token','',{maxAge:1});
        redis.del(req.user?._id || '');
        res.status(200).json({
            success:true,
            message:'User loggedout successfully',
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//update access token
export const updateAccessToken = apiErrorHandler( async (req,res,next) =>{
    try{
        const refresh_token = req.cookies.refresh_token;
        const decode = jwt.verify(refresh_token,process.env.REFRESH_TOKEN);
        if(!decode){
            return next(new ErrorHandler(400,'Could not refresh token'));
        }

        const session = await redis.get(decode.id);
        if(!session){
            return next(new ErrorHandler(400,'Login to access resources'));
        }

        const user = JSON.parse(session);//simple object
        const userDoc = new UserModel(user);//mongoose document

        const accessToken = userDoc.signAccessToken();
        const refreshToken = userDoc.signRefreshToken();
        // const accessToken = jwt.sign({id:user._id},process.env.ACCESS_TOKEN,{
        //     expiresIn:'5m'
        // });
        // const refreshToken = jwt.sign({id:user._id},process.env.REFRESH_TOKEN,{
        //     expiresIn:'3d'
        // });

        req.user=user;
        res.cookie('access_token',accessToken,accessTokenOptions);
        res.cookie('refresh_token',refreshToken,refreshTokenOptions);
        await redis.set(user._id,JSON.stringify(user),'EX',604800)//7days in seconds
        res.status(200).json({
            success:true,
            accessToken,
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//get user(my profile) info
export const getUserInfo = apiErrorHandler( async (req,res,next) =>{
    try{
        const userId = req?.user?._id;
        getUserById(userId,res);
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//social auth (google)
export const socialAuth = apiErrorHandler( async (req,res,next) =>{
    try{
        const {name,email,avatar} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            const newUser = await UserModel.create({
                name,
                email,
                avatar,
            });
            sendToken(newUser,200,res);
        }else{
            sendToken(user,200,res);
        }
        res.status(201).json({
            success:true,
            message:'User info updated successfully',
            user,
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//update user info (name or email)
export const updateUserInfo = apiErrorHandler( async (req,res,next) =>{
    try{
        const {name,email} = req.body;
        const userId = req.user?._id;
        const user = await UserModel.findById(userId);
        if(email && user){
            const isEmailExist = await UserModel.findOne({email});
            if(isEmailExist){
                return next(new ErrorHandler(400,"Email already exist"));
            }
            user.email=email;
        }
        if(name && user){
            user.name=name;
        }
        await user.save();
        await redis.set(userId,JSON.stringify(user));
        res.status(201).json({
            success:true,
            message:'User details updated successfully',
            user
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//update user password
export const updatePassword = apiErrorHandler( async (req,res,next) =>{
    try{
        const {password,newPassword} = req.body;
        if(!password || !newPassword){
            return next(new ErrorHandler(400,'Please enter password and new password'));
        }
        const user = await UserModel.findById(req.user?._id).select('+password');
        if(user?.password === undefined){
            return next(new ErrorHandler(400,'Invalid useroo'));
        }
        const isPasswordMatched = await user?.comparePassword(password);
        if(!isPasswordMatched){
            return next(new ErrorHandler(400,'Incorrect password'));
        }
        user.password = newPassword;
        await user.save();
        await redis.set(user._id,JSON.stringify(user));

        res.status(201).json({
            success:true,
            message:'Password updated successfully',
            user
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//update avatar (profile picture)
export const updateAvtar = apiErrorHandler( async (req,res,next)=>{
    try{
        const {avatar} = req.body;
        console.log(avatar);
        const userId = req.user?._id;
        const user = await UserModel.findById(userId);
        if(user && avatar){
            if(user?.avatar?.public_id){
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
            }else{
                const myCloud = await cloudinary.v2.uploader.upload(avatar,{
                    folder:"avatars"
                });

                user.avatar={
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                }
                
                await user.save();
                await redis.set(userId,JSON.stringify(user));
                return res.status(201).json({
                    success:true,
                    message:'Profile picture updated successfully',
                    user
                });
            }
       }else{
        res.status(400).json({
            success:false,
            message:'Please select profile picture',
        })
       }
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//get all users (admin only)
export const getAllUsersAdmin = apiErrorHandler( async (req,res,next) =>{
    try{
        const users = await UserModel.find().sort({createdAt:-1});

        res.status(200).json({
            success:true,
            users,
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//update user role
export const updateUserRole = apiErrorHandler( async (req,res,next) =>{
    try{
        const {id,role} = req.body;
        const user = await UserModel.findByIdAndUpdate(id,{role:role},{new:true});

        res.status(200).json({
            success:true,
            user,
        })
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});


//delete user (admin only)
export const deleteUser = apiErrorHandler( async (req,res,next) =>{
    try{
        const {id} = req.params;
        const user = await UserModel.findByIdAndDelete(id);
        if (!user) {
            return next(new ErrorHandler(404, "User not found"));
        }
        
        try{
            await redis.del(id);
        }catch(error){
            console.error("Redis delete failed:",error.message);
        }

        res.status(200).json({
            success:true,
            message:'User deleted successfully',
        });
    }catch(error){
        return next(new ErrorHandler(400,error.message));
    }
});