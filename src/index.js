const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// config
app.set("port", process.env.PORT || 3000);

// import routes
const mangasRoutes = require("./routes/mangas.routes");
const manhwasRoutes = require("./routes/manhwas.routes");
const otherFilesRoutes = require("./routes/otherFiles.routes");
const authRoute = require("./routes/auth.routes");

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors());
app.use("/lectortmo-api/mangas", mangasRoutes);
app.use("/lectortmo-api/manhwas", manhwasRoutes);
app.use("/lectortmo-api/files", otherFilesRoutes);
app.use("/lectortmo-api/user", authRoute);

// DB connection
mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connected to DB")
);

// server run
app.listen(app.get("port"));
