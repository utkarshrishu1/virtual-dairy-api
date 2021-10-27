const credentials=require('../src/encrptPassword');
const sgmail=require('@sendgrid/mail');
async function preSave(next){
    const user=this;
    if(user.isModified("password"))
    {
        user.password=await credentials.encryptPassword(user.password);
    }
    next();
}
async function sendMail(user){
    sgmail.setApiKey(process.env.SENDGRIDAPIKEY);
    await sgmail.send({
        to:user.email,
        from:"rockstar032001@gmail.com",
        subject:"Account created Successfully",
        html:"Congrats <Strong>"+user.name+"</Strong>,<br>Your Virtual Dairy account has been created Successfully.<br>Now,you can safely store your passwords,notes and other documents.<br>Thank you"
    });
}
const checkDetails=async (email,password)=>{
    const User=require('../Models/userModel');
    const user=await User.findOne({email});
    if(!user)
    {
        throw new Error("Invalid Credentials");
    }
    if((await credentials.matchPassword(password,user.password))==false)
    {
        throw new Error("Invalid Credentials");
    }
    return user;
}
module.exports={preSave,sendMail,checkDetails};