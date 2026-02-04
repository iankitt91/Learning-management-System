import { redis } from "./redis.js";


const accessTokenExpireIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE_IN || '5',10);
const refreshTokenExpireIn = parseInt(process.env.REFRESH_TOKEN_EXPIRE_IN || '3',10);

export const accessTokenOptions = {
    expires:new Date(Date.now() + accessTokenExpireIn * 60 *1000),
    maxAge:accessTokenExpireIn * 60 * 1000,
    httpOnly:true,
    sameSite:'lax',
}
export const refreshTokenOptions = {
    expires:new Date(Date.now() + refreshTokenExpireIn * 24 * 60 * 60 * 1000),
    maxAge:refreshTokenExpireIn * 24 * 60 * 60 * 1000,
    httpOnly:true,
    sameSite:'lax',
}


export const sendToken = async (user,statusCode,response) =>{
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();

    const {password:_,...safeUser} = user.toObject();

    //upload session to redis
    await redis.set(user._id,JSON.stringify(safeUser));

    //set cookie and cookie options
    
    if(process.env.NODE_ENV==='production'){
        accessTokenOptions.secure=true;
        refreshTokenOptions.secure=true;
    }

    response.cookie('access_token',accessToken,accessTokenOptions);
    response.cookie('refresh_token',refreshToken,refreshTokenOptions);
    response.status(statusCode).json({
        success:true,
        message:"User loggedin successfully",
        user:safeUser,
        accessToken,
    });
}