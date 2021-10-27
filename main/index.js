const mongoose=require('mongoose');
const express=require('express');
const userRouter=require('../Routes/userRoute');
const DairyRouter=require('../Routes/DairyRoute');
mongoose.connect(process.env.MONGODB_URL);
const app=express();
app.use(express.json());
app.use(userRouter,DairyRouter);
app.listen(process.env.PORT,()=>{
    console.log("Server Running!!!");
});