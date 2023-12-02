const { validationResult } = require("express-validator");
const { db } = require("../firebase.js");
const {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  deleteDoc,
} = require("firebase/firestore");

const MENU_COLLECTION = "menu";

const checkBodyData = (req, next) => {
  const errors = validationResult(req).errors;
  if (errors.length !== 0) {
    const error = new Error("Validation failed,entered data is incorrect");
    error.statusCode = 422;
    error.data = errors;
    next(error);
    // throw error;
  }
};

exports.addMenu = async (req, res, next) => {
  checkBodyData(req, next);
  try {
    const { day, meal, menu } = req.body;
    const hostel = req.hostel;
    const hostelPOR = req.hostelPOR;
    if (hostelPOR != "Mess") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Only mess secretaries can add/update menu",
      });
    }
    const docRef = doc(db, MENU_COLLECTION, hostel, day, meal);
    await setDoc(docRef, {
      menu: menu,
    });
    res.status(200).json({
      message: "Menu Updated",
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
