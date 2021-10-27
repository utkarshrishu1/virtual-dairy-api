const sgmail=require('@sendgrid/mail');
async function sendMail(doc,next){
    const otpDetails=doc;
    sgmail.setApiKey(process.env.SENDGRIDAPIKEY);
    await sgmail.send({
        to:otpDetails.email,
        from:"rockstar032001@gmail.com",
        subject:"Verify your Email",
        html:'Welcome to Virtual Dairy,<br>Please verify your Email using <Strong>'+otpDetails.otp+'</Strong> as verification code.<br>Thank you'
    });
    next();
}
const verifyMail=async (email,otp)=>{
    const Otp=require('../Models/otpModel');
    const otpDetails=await Otp.findOne({"email":email,"otp":otp});
    if(!otpDetails)
    {
        throw new Error("Otp Incorrect");
    }
    return otpDetails;
}
module.exports={sendMail,verifyMail};