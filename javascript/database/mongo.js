const express = require('express');
const app = express();
app.use(express.json());
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sneha207gupta:rGXN4wSFrN0NkTVy@cluster1.emww0td.mongodb.net/myMongo?tls=true')
const User = mongoose.model("users", { name: String, email: String, password: String }) //i have defined a model means every object that will be created in my collection will have same model type i.e. the properties of a model

app.post("/signUp", async function (req, res) {
    const userName = req.body.userName;
    const password = req.body.password;
    const Email = req.body.email;
    let existingUser = await User.findOne({ email: Email })//to check if this email already exists
    if (existingUser) {
        res.status(400).json({
            msg: "email already exists"
        })
    }
    else {
        const user = new User({
            name: userName, //name is instance of mongo and userName is instance of request
            email: Email,
            password: password,
        
        })
        await user.save();

        res.json({
            msg: "user is created"
        })
    }

})

app.listen(3001);
//mongodb+srv://sneha207gupta:rGXN4wSFrN0NkTVy@cluster1.emww0td.mongodb.net/?tls=true

