const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// config
app.set("port", process.env.PORT || 4000);

// import routes
const mangasRoutes = require("./routes/mangas.routes");
const manhwasRoutes = require("./routes/manhwas.routes");
const novelsRoutes = require("./routes/novels.routes");
const authRoute = require("./routes/auth.routes");

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/mangas", mangasRoutes);
app.use("/manhwas", manhwasRoutes);
app.use("/novels", novelsRoutes);
app.use("/user", authRoute);

// DB connection
mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connected to DB")
);

// server run
app.listen(app.get("port"));
