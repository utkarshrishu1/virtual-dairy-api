const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const createToken = (id) => {
    const token = jwt.sign({ _id: id.toString() }, process.env.SECRETKEY);
    return token;
}
const isAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const user = await User.findOne({ "_id": decoded._id, "tokens.token": token });
        if (!user) {
            throw new Error("User not Autherized");
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ "error": error.message });
    }
}
module.exports = { createToken, isAuth };