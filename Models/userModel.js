const mongoose=require('mongoose');
const validator=require('validator');
const middleware=require('../Middlewares/UserMiddleware');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter a valid Email");
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Please use a Strong Password");
            }
        }
    },profilePic:{
        type:Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }
    ]
},{timestamps:true});

userSchema.pre("save",middleware.preSave);
userSchema.statics.login=middleware.checkDetails;
userSchema.methods.toJSON=function(){
    const user=this.toObject();
    delete user.tokens;
    delete user.password;
    delete user._id;
    return user;
}
const User=mongoose.model('users',userSchema);
module.exports=User;