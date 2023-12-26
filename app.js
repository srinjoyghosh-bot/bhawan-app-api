const express = require("express");
const bodyParser = require("body-parser");
const dotenv=require("dotenv")

dotenv.config()
const app = express();

const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const authRoutes = require("./routes/auth.js");
const complainsRoutes = require("./routes/complains.js");
const menuRoutes = require("./routes/menu.js");

app.use("/auth", authRoutes);
app.use("/complains", complainsRoutes);
app.use("/menu", menuRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({
    message: err.message,
    data: err.data,
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
