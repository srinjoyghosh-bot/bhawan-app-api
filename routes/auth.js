const authController = require("../controllers/auth.js");
const express = require("express");
const { body } = require("express-validator");
const { db } = require("../firebase.js");
const { collection, query, where, getDocs } = require("firebase/firestore");
const router = express.Router();

const STUDENTS_COLLECTION = "students";

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter an email")      
      .normalizeEmail(),
    body("enrollment")
      .trim()
      .isNumeric()
      .isLength({
        max: 8,
        min: 8,
      })
      .withMessage("Enrollment must be 8 characters")
      .custom( (value, { req }) => {
        const collectionRef = collection(db, STUDENTS_COLLECTION);
        const enrollmentQuery = query(
          collectionRef,
          where("enrollment", "==", value)
        );
        return getDocs(enrollmentQuery).then(snapshot=>{
          if (!snapshot.empty) {
            return Promise.reject("Enrollment id already exists")
          } 
        })
        
      }),
    body("password")
      .trim()
      .isLength({
        min: 8,
      })
      .withMessage("Password must be atleast 8 characters"),
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("enrollment")
      .trim()
      .isLength({
        max: 8,
        min: 8,
      })
      .withMessage("Enrollment must be 8 characters"),
    body("password")
      .trim()
      .isLength({
        min: 8,
      })
      .withMessage("Password must be atleast 8 characters"),
  ],
  authController.login
);

module.exports = router;
