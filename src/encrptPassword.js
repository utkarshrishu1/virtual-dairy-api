const bcrypt=require('bcryptjs');
const encryptPassword=async (password)=>{
    const hashedPassword=await bcrypt.hash(password,8);
    return hashedPassword;
}
const matchPassword=async(password,hashedPassword)=>{
    if(await bcrypt.compare(password,hashedPassword))
    return true;
    return false;
}
module.exports={encryptPassword,matchPassword};
