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
const generateUniqueId = require("generate-unique-id");

const COMPLAINS_COLLECTION = "complains";

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

exports.add = async (req, res, next) => {
  checkBodyData(req, next);
  try {
    const { title, content, complainType } = req.body;
    const enrollment = req.enrollment;
    const hostel = req.hostel;
    if (!title || !content || !complainType) {
      return res.status(400).json({
        error: "Bad Request",
        message: "title, content and complainType are required",
      });
    }
    //const collectionRef = collection(db, COMPLAINS_COLLECTION);
    const complainId = generateUniqueId({ length: 10 });
    const complain = {
      id: complainId,
      student: enrollment,
      title: title,
      content: content,
      hostel: hostel,
      complainType: complainType,
      createdAt: new Date(),
      isResolved: false,
    };
    //console.log(complain);
    const docRef = doc(db, COMPLAINS_COLLECTION, complainId);
    await setDoc(docRef, complain);
    res.status(200).json({
      message: "Complain added successfully",
      complainId: complainId,
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getComplains = async (req, res, next) => {
  checkBodyData(req, next);
  try {
    const hostel = req.hostel;
    const { complainType } = req.body;
    const collectionRef = collection(db, COMPLAINS_COLLECTION);
    let complainsQuery;
    if (!complainType) {
      complainsQuery = query(collectionRef, where("hostel", "==", hostel));
    } else {
      complainsQuery = query(
        collectionRef,
        where("hostel", "==", hostel),
        where("complainType", "==", complainType)
      );
    }
    const querySnapshot = await getDocs(complainsQuery);
    let complains = [];
    querySnapshot.forEach((doc) => {
      complains.push(doc.data());
    });
    res.status(200).json({
      complains: complains,
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  checkBodyData(req, next);
  try {
    const complainId = req.params.id;
    const student = req.enrollment;
    const docRef = doc(db, COMPLAINS_COLLECTION, complainId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists || !docSnap.data()) {
      return res.status(404).json({
        message: "Complain not found",
      });
    }
    const complain = docSnap.data();
    if (complain.student != student) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Cannot delete someone else's complain",
      });
    }
    await deleteDoc(docRef);
    res.status(200).json({
      message: "Complain deleted successfully",
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.markAsResolved = async (req, res, next) => {
  try {
    const complainId = req.query.id;
    const student = req.enrollment;
    const hostelPOR = req.hostelPOR;
    const hostel = req.hostel;
    const docRef = doc(db, COMPLAINS_COLLECTION, complainId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists || !docSnap.data()) {
      return res.status(404).json({
        message: "Complain not found",
      });
    }
    const complain = docSnap.data();   
    if (
      complain.hostel != hostel ||
      hostelPOR == "Student" ||
      complain.complainType != hostelPOR
    ) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Only hostel secretaries can resolve respective complains",
      });
    }
    complain.isResolved = !complain.isResolved;
    await setDoc(docRef, complain);
    res.status(200).json({
      message: "Complain marked as resolved/unresolved!",
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
