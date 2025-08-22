const mongo = require('mongoose');
require('dotenv').config();


const userSchema = new mongo.Schema({
    _id: {
        type: String,
        required: true,
        
    },
    email:{
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        lowercase: true,
        unique: true,
        required: true,
         sparse: true
    },
    userName: {
        type: String,
        unique: true,
        required: true,
    },
    firstName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        required: true,
         sparse: true
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        required: true,
    },
    phoneNumber: {
        type:String,
        required: true,
        minLength: 13,
        unique:true,
    },
     status: { type: String, enum: ["active","blocked"], default: "active" },
  lastLoginAt: Date
}, { timestamps: true });




const User = mongo.model("User", userSchema);
module.exports = { User };

