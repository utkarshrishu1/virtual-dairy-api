const mongoose=require('mongoose');
const validator=require('validator');
const middlewares=require('../Middlewares/otpMiddleware');
const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error("Enter a valid Email");
            }
        }
    },
    otp:{
        type:Number,
        required:true
    }
});
otpSchema.post("save",middlewares.sendMail);
otpSchema.statics.verifyEmail=middlewares.verifyMail;
const otpModel=mongoose.model("Otp",otpSchema);
module.exports=otpModel;