// //cryptographic jargons
// //Hashing
// //encryption
// //JWT tokens
// //local storage

// const express = require('express');
// const jwt = require('jsonwebtoken');
// const app = express();
// const jwtpassword = "12345";
// app.use(express.json());

// const allUsers = [
//     { user_Name: "sneha207gupta@gmail.com", password: "kannipagl", Name: "sneha" },
//     { user_Name: "kanni207gupta@gmail.com", password: "kanni", Name: "Kanishk" },
//     { user_Name:"elonmusk@gmail.com",password:"ello",Name:"Elon"},
// ]
// function userExist(userName,password){
//     let userExist = false;
//     for (let i = 0; i < allUsers.length; i++){
//         if (allUsers[i].user_Name == userName && allUsers[i].password==password) {
//             userExist = true;
//         }
//     }
//     return userExist;
// }
// app.post("/signIn", function (req, res) {
//     const userName = req.body.user_Name;
//     const password = req.body.password;
//     if (!userExist(userName,password)) {
//         return res.status(403).json({ msg: "user does'nt exist" });
//     }
    
//     var token = jwt.sign({
//         user_Name:userName
//     },jwtpassword)
   
//     return res.json({ token });
// });

// app.get("/users", function (req, res) {
//     const token = req.headers.authorization;
//     try {
//         const decoded = jwt.verify(token, jwtpassword)
//         const username = decoded.username;
//         res.json({
//             users: allUsers.filter(function (value) {
//                 if (value.user_Name == username) {
//                     return false;
//                 }   
//                 return true;
//             })
//         })
//     }
//     catch (err) {
//         res.status(411).json({ msg: "something went wrong" });
//     }
// })
// app.listen(3002);

//for creation of a token and verification , jwtpass is necessaary , but for decoding it is not required 



// //JWTtask1:
// //write a function that takes in username and pass, and returns jwt token with the username encoded inside an object , should return null if username is not a valid email or if the pass is less than 6 characters 
// //write a function that takes a jwt as input and return true if the jwt can be decoded(not verified),return false otherwise
// // write a function that takes a jwt as input and return true if the jwt can be verified,return false otherwise

// //1.
// const express = require('express');
// const app = express();
// const jwt = require('jsonwebtoken');
// const jwtpass = "12345";
// const zod = require('zod');
// app.use(express.json()); //used in request/middleware

// const emailSchema = zod.string().email();
// const passSchema = zod.string().min(6);
// function signUp(username, pass) {
//     const userNameresponse = emailSchema.safeParse(username); //validating data against a defined schema without throwing an error
//     const passwordresponse = passSchema.safeParse(pass);
//     if (!userNameresponse.success || !passwordresponse.success) {
//         return null;
//     }
//     const signature = jwt.sign({ username }, jwtpass);
//     return signature;
// }

// function decoding(signature) {
//     const decoded = jwt.decode(signature);
//     if (decoded) {
//         return true;
//     }
//     else {
//         return false;
//     }
// }
// function verifying(signature,jwtpassword) {
//     try {
//         const verified = jwt.verify(signature, jwtpassword);
//         return true;
//     }
//     catch(err) {
//         return false; 
//     }
// }
// const sign = signUp("sneha207gupta@gmail.com", "snehagupta");
// console.log(sign);
// console.log(decoding(sign));
// console.log(verifying(sign,jwtpass));

// app.listen(3001)


//task2
//you have been givem an express server which has few endpoints 
//your task is to create a global middleware(app.use),which will maintain a count of the number of request made to the serve in the global "requestCount" variable

// const express = require('express');
// const app = express();
// let count = 0;

// app.use(function(req,res,next) {
//     count = count + 1;
//     next();
// });
// app.get("/user", function (req, res) {
//     const username= "sneha";
//     res.status(200).json({ username });
// })
// app.post("/user", function (req, res) {
//     res.status(200).json({msg:"created dummy user"});
// })
// app.get("/count", function (req, res) {
//     res.status(200).send(count);
// })
// app.listen(3000);


//task3
//you have been givem an express server which has few endpoints 
//your task is to create a global middleware(app.use),which will rate limit the request from a user to only 5 req/5 sec.if a user send more than 5 req in a second , the server should block them with a 404 error code.userID of user is given in header as "user-id",you have been given noOfRequestForUser object to start up which clears every 1 second 

// const express = require("express");
// const app = express();
// let noOfRequestForUser = {}
// setInterval(function() {
//     noOfRequestForUser = {};
// },5000)
// app.use(function(req,res,next) {
//     const userID = req.headers["user-id"];
//     if (noOfRequestForUser[userID]) {
//         noOfRequestForUser[userID] = noOfRequestForUser[userID] + 1;
//         if (noOfRequestForUser[userID] > 5) {
//             res.status(404).send("you have been blocked");
//         }
//         else {
//             next();
//         }
//     }
//     else {
//         noOfRequestForUser[userID] = 1;
//         next();
//     }
// })
// app.get("/user", function (req, res) {
//     const username= "sneha";
//     res.status(200).json({ username });
// })
// app.post("/user", function (req, res) {
//     res.status(200).json({msg:"created dummy user"});
// })
// app.get("/count", function (req, res) {
//     res.status(200).send(noOfRequestForUser);
// })
// app.listen(3000);