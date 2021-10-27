const express = require('express');
const router = new express.Router();
const User = require('../Models/userModel');
const Otp = require('../Models/otpModel');
const authToken = require('../src/authToken');
const UserMiddleware = require('../Middlewares/UserMiddleware');
const multer = require('multer');
const sharp = require('sharp');
const route = require('./DairyRoute');
router.post("/createUser", async (req, res) => {
    try {
        const user = new User(req.body);
        if (!user) {
            throw new Error("Enter valid details");
        }
        await user.save();
        await UserMiddleware.sendMail(user);
        res.status(201).send({ "created": "user created successfully" });
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
});
router.post("/forgetPassword",async (req,res)=>{
    try{
        const user=await User.findOne(req.body);
        if(!user){
            throw new Error("No user Exist");
        }
        res.send({"message":"user Exist"});
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
router.post("/sendOtp", async (req, res) => {
    try {
        const oldRequest = await Otp.findOne({ "email": req.body.email });
        if (oldRequest) {
            await Otp.deleteOne({ "_id": oldRequest._id });
        }
        const randomNumber = Math.floor(Math.random() * 90000) + 10000;
        const otpRequest = new Otp({ "email": req.body.email, "otp": randomNumber });
        await otpRequest.save();
        res.send({ "message": "Otp Sent Successfully" });
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
});
router.post("/verifyOtp", async (req, res) => {
    try {
        const verified = await Otp.verifyEmail(req.body.email, req.body.otp);
        await Otp.deleteOne({ "_id": verified._id });
        res.send({ "message": "Verified Successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).send({ "error": error.message });
    }
});
router.post("/login", async (req, res) => {
    try {
        const user = await User.login(req.body.email, req.body.password);
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const token = authToken.createToken(user._id);
        user.tokens = user.tokens.concat({ token });
        await user.save();
        res.send({ user, "token": token });
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
});
router.patch("/user/update", authToken.isAuth, async (req, res) => {
    try {
        const user = req.user;
        const validChanges = ["name", "email", "password"];
        const isValid = true;
        Object.keys(req.body).forEach((key) => {
            if (validChanges.includes(key) == false) {
                isValid = false;
            }
        })
        if (isValid == false) {
            throw new Error("Invalid Changes");
        }
        Object.keys(req.body).forEach((key) => {
            user[key] = req.body[key];
        });
        await user.save();
        res.send({ "message": "Changes made successfully" });
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
});
router.delete("/user/delete", authToken.isAuth, async (req, res) => {
    try {
        await User.deleteOne({ "_id": req.user._id });
        res.send({ "message": "Account Deleted Successfully" });
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
})
router.post("/logout", authToken.isAuth, async (req, res) => {
    try {
        const user = req.user;
        const token = req.token;
        user.tokens = user.tokens.filter((obj) => {
            return obj.token !== token
        });
        await user.save();
        res.send({ "message": "Logged out Successfully" });
    } catch (error) {
        res.status(500).send({ "error": error.message });
    }
});
const uploadPicture = multer({
    limits: {
        fileSize: 500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|)$/)) {
            cb(new Error("Image must be jpg, jpeg or png"));
        }
        cb(undefined, true);
    }
});
route.post('/user/upload/profilePic', authToken.isAuth, uploadPicture.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300, fit: sharp.fit.inside, withoutEnlargement: true }).png().toBuffer();
    req.user.profilePic = buffer;
    await req.user.save();
    res.send({ "message": "Image uploaded successfully" });
}, (error, req, res, next) => {
    res.status(400).send({ "error": error.message });
});
route.get('/user/profilePic', authToken.isAuth, (req, res) => {
    try {
        res.set('content-type', 'image/png');
        if(req.user.profilePic===undefined)
        {
            res.set('content-type','application/json');
            res.send({"message":"No profile picture uploaded"});
        }
        res.send(req.user.profilePic);
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
});
route.delete('/user/delete/profilePic',authToken.isAuth,async(req,res)=>{
    try{
        req.user.profilePic=undefined;
        await req.user.save();
        res.send({"message":"Profile picture deleted"});
    }catch(error){
        res.status(400).send({"error":error.message});
    }
});
module.exports = router;