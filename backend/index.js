const express = require('express'); 
require('dotenv').config();
const database = require("./db");
const rootRouter = require("./routesApi/routes");

const app = express();
const cors = require('cors'); //cross origin resource sharing
app.use(express.json());
app.use(cors({ origin: true, credentials:true }));
app.use("/api/v1", rootRouter);



database.connect();
app.listen(3000);