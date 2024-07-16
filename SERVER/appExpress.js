const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./app/routes/index");
const app = express();
const path = require("path");
const admin = require("firebase-admin");
const NodeSchedule = require("./app/controllers/NodeSchedule");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "autoplay=(*)");
  next();
});
// Use CORS middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.static(path.join(__dirname, "..", "public", "images")));

// Routes
app.use("/", routes);

module.exports = app;
