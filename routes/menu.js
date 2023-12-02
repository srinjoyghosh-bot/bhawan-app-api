const menuController = require("../controllers/menu.js");
const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is_auth.js");
const router = express.Router();

router.post("/add",isAuth,menuController.addMenu)

module.exports=router