import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name'],
        trim:true,
    },
    email:{
        type:String,
        required:[true,'Enter your email'],
        validate:{
            validator:function(value){
                return emailRegexPattern.test(value);
            },
            message:'Enter valid email',
        },
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        minlength:[6,'Password should atleast 6 characters'],
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        },
    },
    role:{
        type:String,
        default:"user",
    },
    isVarified:{
        type:Boolean,
        default:false,
    },
    courses:[
        {
            courseId:{
                type:String,
            }
        }
    ],
},{timestamps:true});


//hash password before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password,10);
});


//compare password while login
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}


//sign access token
userSchema.methods.signAccessToken = function(){
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || '',{
        expiresIn:'5m',
    });
}


//sign refresh token
userSchema.methods.signRefreshToken = function(){
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || '',{
        expiresIn:'3d',
    });
}

export const UserModel = mongoose.model('user',userSchema);