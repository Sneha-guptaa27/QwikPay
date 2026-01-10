require("dotenv").config();            // 1) load .env BEFORE any other imports

const express = require("express");
const cookieParser = require("cookie-parser");
const database = require("./db");
const rootRouter = require("./routesApi/routes");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use("/api/v1", rootRouter);

database.connect();

const PORT = process.env.PORT || 3000; // 2) read port from env (avoid 3000)
app.listen(PORT, () => console.log(`API running on ${PORT}`));
