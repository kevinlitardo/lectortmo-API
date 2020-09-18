const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

// config
app.set("port", process.env.PORT || 3000);

// import routes
const mangasRoutes = require("./routes/mangas.routes");
const manhwasRoutes = require("./routes/manhwas.routes");
const otherFilesRoutes = require("./routes/otherFiles.routes");

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/lectortmo-api/mangas", mangasRoutes);
app.use("/lectortmo-api/manhwas", manhwasRoutes);
app.use("/lectortmo-api/files", otherFilesRoutes);

// DB connection
mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connected to DB")
);
// server run

app.listen(app.get("port"));
