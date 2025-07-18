const mongo = require('mongoose');
require('dotenv').config()

mongo.connect(process.env.MONGODB_URL);

const userschema = new mongo.Schema({
    username:{
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    firstName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 30,
        required: true,
    }
});


const accountSchema = new mongo.Schema({
    userId: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    accountBalance: {
        type: Number,
        required:true
    }
})

const User = mongo.model('User', userschema);
const Account = mongo.model('Account', accountSchema);


module.exports = {
    User,Account
}