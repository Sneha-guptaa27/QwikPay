// const express = require('express');
// const app = express();
// const port = 3000;
// app.use(express.json());
// // app.get("/", function (req, res) {
// //     res.send("hi there")
// // })

// const patient = [
//     {
//         name: "john",
//         kidneys:[
//             {
//                 healthy:false
//             },
//             {
//                 healthy:false
//             }
//         ]
//     }
// ];

// app.get("/", function (req, res) {
//     const johnKidneys = patient[0].kidneys;
//     const noOfKidneys = johnKidneys.length;
//     let healthyKidney = 0;
//     for (let i = 0; i < johnKidneys.length;i++) {
//         if (johnKidneys[i].healthy) {
//             healthyKidney++;
//         }
//     }

//     const unhealthyKidney = noOfKidneys - healthyKidney;
//     res.json(
//         {
//             johnKidneys,
//             noOfKidneys,
//             healthyKidney,
//             unhealthyKidney
//         }
//     );
// });

// //post request
// app.post("/", function (req, res) {
//     console.log(req.body)
//     const isHealthy=req.body.isHealthy
//     patient[0].kidneys.push({ healthy: isHealthy })
//     res.json(
//         {
//             msg: "hello"
            
//         }
//     );
// });

// app.put("/", function (req, res) {
//     for (let i = 0; i < patient[0].kidneys.length; i++){
//         patient[0].kidneys[i].healthy=true
//     }
//     res.json(
//         {
//             msg: "hello"
            
//         }
//     );
// });

// app.delete("/", function (req, res) {
//     let newKidneys = [];
//     for (let i = 0; i < patient[0].kidneys.length; i++){
//         if (patient[0].kidneys[i].healthy = true) {
//             newKidneys.push({ healthy: true })   
//         }
//     }
//     patient[0].kidneys = newKidneys
//     res.json(
//         {
//             msg: "hi i m sneha"
            
//         }
//     );
// });

// app.listen(port, () => {
//     console.log(`listening on port ${port}`)
// })

// TASK2
//  authentication//input validation  (UGLY METHOD-repetitive code)
// const express = require('express')
// const app = express()

// app.get("/health-checkup", function (req, res) {
//     const kidneyId = req.query.kidneyId;
//     const username = req.headers.username;
//     const password = req.headers.password;
//     //authentication
//     if (username != "sneha" || password != "kannipagl") {
//         res.status(403).json({
//             msg: "user doesnt exist"
//         });
//         return;
//     }
//     //input validation
//     if (kidneyId != 1 && kidneyId != 2) {
//         res.status(411).json({    //411 -wrong input //403-unauthorised user
//             msg: "wrong input"
//         });
//         return;
//     }
//     res.send("user exist");
// }
// );
// app.listen(3001);


// // Middleware:main function m jaane se phele jitne bhi prliminary checks ya distinct function bnate h usko miidleware bolte h 
// //1.it enhances code organisation
// //2.it implments prechecks
// //3.DRY principle (dont repeat yourself
// const express = require('express');
// const app = express()
// app.use(express.json());
// // const kidneyId = req.query.kidneyId;
// // const username = req.headers.username;
// // const password = req.headers.password;

// function authenticationMiddleware(req, res, next) {  //next: it is a callback function that is used to pass control to the next miiddleware function in the stack
//     const username = req.headers.username;
//     const password = req.headers.password;
//     //authentication

//         if (username != "sneha" || password != "kannipagl") {
//             res.status(403).json({
//                 msg: "user doesnt exist"
//             });
//             return;
//         }
//         else {
//             next();
//     }
// }
// app.use(authenticationMiddleware);  //If we want to add a middleware function to all routes, then instead of adding it in every route, we can use app.use(middlewareName) i.e. attaching it to app object. This is commonly used for authentication, logging, etc
// function inputValidationMiddleware(req,res,next) {
//     const kidneyId = req.query.kidneyId;
//     if (kidneyId != 1 && kidneyId != 2) {
//                 res.status(411).json({    //411 -wrong input //403-unauthorised user //400-server error
//                     msg: "wrong input"
//                 });
//         return;
//             }
//     else {
//         next();
//     }
//         }
// app.get("/health-checkup", inputValidationMiddleware, function (req, res) {
//     res.send("you're healthy")
// });
// app.get("/userValidation",function (req, res) {
//     res.send("you're authenticated")
// });
// app.get("/kidneyCheck", inputValidationMiddleware, function (req, res) {
//     res.send("you're validated")
// });
// app.post("/kidneyAdd", function (req, res) {
//     const kidney = req.body.kidneys;
//     const kidneyNo = kidney.length;
//     res.send("you have " + kidneyNo + " number of kidneys");
// });

// //global catches: Express comes with a default error handler that takes care of any errors that might be encountered in the application. The default error handler is added as a middleware function at the end of the middleware function stack. This is also called global catching.
// app.use(function error(err, req, res, next) { //function being used for global catch(4 params)
//     res.status(404).json({
//         err: "something went wrong"
//     });
// })

// app.listen(3001);


// //ZOD->schema validation (naive approach can become cumbersome as number of i/p parameters increase and it may lead to code duplication)
// const express = require('express');
// const zod = require('zod');
// const app = express();
// app.use(express.json());

// const loginSchema = zod.object({
//     userName: zod.string().min(3),
//     password: zod.string().min(8)

// })

// app.post("/login", function (req, res) {
//     const userName = req.body.userName;
//     const password = req.body.password;
//     try {
//         loginSchema.parse({
//             userName, password
//         });
//         res.json({ success: true });
//     }
//     catch (error) {
//         res.status(403).send({
//             error: "UNAUTHORISED USER", details: error.errors
//         });
//     }
// });
//     app.listen(3002);

//sign up form using zod
const express = require('express');
const zod = require('zod');
const app = express();
app.use(express.json());

const addressSchema = zod.object({
    street: zod.string({ error: "required field" }),
    city:zod.string({error:"required field"})
})
const signUpSchema=zod.object({
    username: zod.string({ error: "username required" }).trim().min(3, { msg: "username must be atleast 3 char" }).max(255, { msg: "username must not be more than 255 char" }),    //if not string then print msg inside string //trim removes white space only for string
    email: zod.string({ error: "emailrequired" }).trim().min(12,{msg:"mini 12 char required"}).max(255,{msg:"email must not be more than 255 char"}),
    phone:zod.string({error:"phone number required"}).trim().min(10,{msg:"minimum 10 char req"}).max(12,{msg:"max 12"}),
    password: zod.string({ error: "password required" }).trim().min(6, { msg: "password must be atleast 6 char" }).max(255, { msg: "password must not be more than 255 char" }),
    address:addressSchema
})

app.post("/signUp", function (req, res) {
    try {
        const data=signUpSchema.parse(req.body);
        res.json({ msg: "you are signed up",data:data });
    }
    catch (err) {
        if (err instanceof zod.ZodError) {
            const msg = err.errors.map(e=>e.message);
            res.status(400).json(msg)
        }
        res.status(400).send({ error: "something went wrong"});
    }
});
app.listen(3002);

