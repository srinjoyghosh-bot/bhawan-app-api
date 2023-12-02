const complainsController = require("../controllers/complains.js");
const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is_auth.js");
const router = express.Router();

router.post("/add", isAuth, complainsController.add);
router.get("/", isAuth, complainsController.getComplains);
router.delete("/delete/:id",isAuth,complainsController.delete);
router.put("/mark-as-resolved",isAuth,complainsController.markAsResolved)
module.exports = router;
