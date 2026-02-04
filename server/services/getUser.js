import { redis } from "../utils/redis.js";

export const getUserById = async (id,response) =>{
    const userJson = redis.get(id);
    if(userJson){
        const user = JSON.parse(userJson);

        response.status(201).json({
        success:true,
        user,
        });
    }
}