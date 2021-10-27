const mongoose=require('mongoose');
const validator=require('validator');
const dairySchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    recieved:{
        type:Boolean,
        required:true,
    },
    dairyOf:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true
    },
    from:{
        type:String,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Enter a valid Email");
            }
        }
    }
},
{
    timestamps:true
});
const DiaryModel=mongoose.model("Dairy",dairySchema);
module.exports=DiaryModel;