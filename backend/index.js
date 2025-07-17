const express = require('express'); 
const app = express();
app.use(express.json());
require('dotenv').config();
const rootRouter = require("./routesApi/routes");
const cors = require('cors'); //cross origin resource sharing
app.use(cors());
app.use("/api/v1", rootRouter);



app.listen(3000);