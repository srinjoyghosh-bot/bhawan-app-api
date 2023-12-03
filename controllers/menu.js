const { validationResult } = require("express-validator");
const { db } = require("../firebase.js");
const { setDoc, doc, getDoc, collection, addDoc, where, getDocs, deleteDoc } = require("firebase/firestore");

const MENU_COLLECTION = "menu";
const STUDENTS_COLLECTION = "students";

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
    const { day, meal, menu, hasCoupon } = req.body;
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
      hasCoupon:hasCoupon,
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

exports.getMenu = async (req, res, next) => {
  try {
    const day = req.query.day;
    const hostel = req.hostel;
    const breakfastDocRef = doc(db, MENU_COLLECTION, hostel, day, "Breakfast");
    const lunchDocRef = doc(db, MENU_COLLECTION, hostel, day, "Lunch");
    const dinnerDocRef = doc(db, MENU_COLLECTION, hostel, day, "Dinner");
    let breakfast, lunch, dinner;
    const breakfastDocSnap = await getDoc(breakfastDocRef);
    const lunchDocSnap = await getDoc(lunchDocRef);
    const dinnerDocSnap = await getDoc(dinnerDocRef);
    if (!breakfastDocSnap.exists() || !breakfastDocSnap.data()) {
      breakfast = null;
    } else {
      breakfast = breakfastDocSnap.data();
    }
    if (!lunchDocSnap.exists || !lunchDocSnap.data()) {
      lunch = null;
    } else {
      lunch = lunchDocSnap.data();
    }
    if (!dinnerDocSnap.exists || !dinnerDocSnap.data()) {
      dinner = null;
    } else {
      dinner = dinnerDocSnap.data();
    }
    res.status(200).json({
      breakfast: breakfast,
      lunch: lunch,
      dinner: dinner,
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
// apply/unapply for coupon
exports.applyCoupon=async (req,res,next)=>{
  try {
    const {day,meal} = req.query
    const {name,enrollment,hostel} =req
    const menuDocRef=doc(db,MENU_COLLECTION,hostel,day,meal)
    const menuDocSnap=await getDoc(menuDocRef)
    const menu=menuDocSnap.data()
    if(!menuDocSnap.exists() || !menuDocSnap.data() || !menuDocSnap.data().hasCoupon){
      return res.status(403).json({
        error:"Forbidden",
        message:"Cannot apply for coupon"
      })
    }
    const studentDocRef=doc(db,STUDENTS_COLLECTION,enrollment)
    const studentDocSnap=await getDoc(studentDocRef)
    if(!studentDocSnap.exists()){
      return res.status(404).json({     
        message:"Student not found"
      })
    }   
    const couponCollectionRef=collection(db,MENU_COLLECTION,hostel,day,meal,"Coupons")
    const couponQuery=query(couponCollectionRef,where("enrollment","==",enrollment))
    const querySnapshot=await getDocs(couponQuery)
    if(querySnapshot.empty)
    {
      const couponDocRef=await addDoc(couponCollectionRef,{
        name:name,
        enrollment:enrollment
      })
      res.status(200).json({
        message:"Applied for coupon"
      })
    }else{
      const couponDoc=querySnapshot.docs[0]
      await deleteDoc(couponDoc.ref)
      res.status(200).json({
        message:"Unapplied for coupon"
      })
    }
    
    
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
  
  

}
