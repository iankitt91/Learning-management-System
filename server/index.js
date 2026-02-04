import app from "./app.js";
import dotenv from 'dotenv';
import connectDB from "./utils/database.js";
import {v2 as cloudinary} from 'cloudinary';

dotenv.config({
    path:'./.env',
});

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY,
});

const port = process.env.PORT || 3000;


app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
    connectDB();
})