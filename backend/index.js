const express = require('express'); 
require('dotenv').config();
const rootRouter = require("./routesApi/routes");
const app = express();
const cors = require('cors'); //cross origin resource sharing
app.use(express.json());
app.use(cors());
app.use("/api/v1", rootRouter);


app.listen(3000);