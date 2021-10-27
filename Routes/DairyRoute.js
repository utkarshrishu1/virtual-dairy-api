const express=require("express");
const route=new express.Router();
const auth=require('../src/authToken');
const Dairy=require('../Models/DairyModel');
const User=require('../Models/userModel');
const DiaryModel = require("../Models/DairyModel");
route.post('/createDairy',auth.isAuth,async (req,res)=>{
    try{
        const dairy=new Dairy({...req.body,"recieved":false,"dairyOf":req.user._id});
        await dairy.save();
        res.send({"message":"Dairy created succesfully"});
    }catch(error){
        res.status(500).send({"error":error.message});
    }
});
route.get('/viewDairy/:recieved',auth.isAuth,async(req,res)=>{
    try{
        const dairy=await Dairy.find({"dairyOf":req.user._id,"recieved":req.params.recieved});
        if(dairy.length==0)
        {
            res.send({"message":"Nothing Found in Dairy"});
        }
        res.send(dairy);
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
route.get('/viewDairy/:recieved/:id',auth.isAuth,async(req,res)=>{
    try{
        const dairy=await Dairy.findOne({"_id":req.params.id,"dairyOf":req.user._id,"recieved":req.params.recieved});
        if(!dairy)
        {
            res.send({"message":"Nothing Found"});
        }
        res.send(dairy);
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
route.delete('/dairy/delete/:recieved/:id',auth.isAuth,async(req,res)=>{
    try{
        const dairy=await Dairy.findOne({"_id":req.params.id,"dairyOf":req.user._id,"recieved":req.params.recieved});
        if(!dairy)
        {
            throw new Error("No such page in dairy found");
        }
        await Dairy.deleteOne(dairy);
        res.send({"message":"Deleted successfully"});
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
route.patch('/dairy/update/:recieved/:id',auth.isAuth,async (req,res)=>{
    try{
        if(req.params.recieved==="true")
        {
            throw new Error("You can't edit recieved messages");
        }
        const validOperations=["title","description"];
        let valid=true;
        Object.keys(req.body).forEach((key)=>{
            if(!validOperations.includes(key))
            {
                valid=false;
            }
        });
        if(valid==false)
        {
            throw new Error("Invalid operartions");
        }
        const dairy=await Dairy.findOne({"_id":req.params.id,"dairyOf":req.user._id,"recieved":req.params.recieved});
        if(!dairy)
        {
            throw new Error("No such page in dairy found");
        }
        Object.keys(req.body).forEach((key)=>{
            dairy[key]=req.body[key];
        });
        await dairy.save();
        res.send({"message":"updated successfully"});
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
route.post('/dairy/send/:id',auth.isAuth,async (req,res)=>{
    try{
    const user=await User.findOne({"email":req.body.email});
    if(!user)
    {
        throw new Error("No user exist with this Email");
    }
    const dairy=await Dairy.findOne({"_id":req.params.id});
    if(!dairy)
    {
        throw new Error("No such dairy exist");
    }
    const newDairy=new Dairy({"title":dairy.title,"description":dairy.description,"recieved":true,"from":req.user.email,"dairyOf":user._id});
    await newDairy.save();
    res.send({"message":"This Dairy note has been sent successfully"});
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
module.exports=route;