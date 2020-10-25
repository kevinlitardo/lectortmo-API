const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// config
app.set("port", process.env.PORT || 4000);

// import routes
const filesRoutes = require("./routes/files.routes");
const authRoute = require("./routes/user.routes");

// middlewares
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(express.json({limit: '50mb'}));
app.use(cors({ 
  credentials: true, 
  origin: ["http://localhost:3000", "https://lectortmo.netlify.app/"],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(cookieParser());
app.use("/api", filesRoutes);
app.use("/user", authRoute);

// DB connection
mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connected to DB")
);

// server run
app.listen(app.get("port"));
