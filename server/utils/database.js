import mongoose from 'mongoose';

const connectDB = async () =>{
    try{
        mongoose.connect(`${process.env.MONGODB_URI}/LearningManagementSystem`).then((data) =>{
            console.log(`Database Connected ${data.connection.host}`);
        })
    }catch(error){
        console.log(`Error in connecting databse ${error}`);
        process.exit(1);
    }
}

export default connectDB;