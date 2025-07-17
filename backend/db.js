const mongo = require('mongoose');

mongo.connect("mongodb+srv://sneha207gupta:rGXN4wSFrN0NkTVy@cluster1.emww0td.mongodb.net/paytm?tls=true");

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

const User = mongo.model('User', userschema);

module.exports = {
    User
}

// const mongoose = require('mongoose');
// require('dotenv').config();

// mongoose.connect(process.env.MONGODB_URL);

// const userSchema = new mongoose.Schema({
//     userName: {
//         type: String,
//         required: true,
//         minLength: 3,
//         maxLength:30,
//         trim: true,
//         unique: true,
//         lowercase:true,
//     },
//     firstName: {
//         type: String,
//         required: true,
//         maxLength:15,
//         trim: true,
//     },
//     lastName: {
//         type: String,
//         required: true,
//         maxLength:15,
//         trim: true,
//     },
//     password: {
//         type: String,
//         required: true,
//         minLength: 8,
//     },
// })
// const User=mongoose.model("User", userSchema);
// module.exports = { User };
