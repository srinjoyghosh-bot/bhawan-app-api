const { validationResult } = require("express-validator");
const { db } = require("../firebase.js");
const {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} = require("firebase/firestore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const STUDENTS_COLLECTION = "students";
const SALT_ROUNDS = 12;

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

exports.register = async (req, res, next) => {
  checkBodyData(req, next);
  const {
    name,
    enrollment,
    password,
    email,
    department,
    branch,
    degreeType,
    isHostelSecretary,
    hostelSecretaryPOR,
    hostel,
  } = req.body;
  if (
    !name ||
    !enrollment ||
    !password ||
    !email ||
    !department ||
    !branch ||
    !degreeType ||
    !hostel
  ) {
    return res.status(400).json({
      error:
        "name,enrollment,password,email,department,branch,degreeType are necessary",
    });
  }
  try {
    const collectionRef = collection(db, STUDENTS_COLLECTION);
    const hashedPw = await bcrypt.hash(password, SALT_ROUNDS);
    const student = {
      name: name,
      enrollment: enrollment,
      password: hashedPw,
      email: email,
      department: department,
      branch: branch,
      degreeType: degreeType,
      isHostelSecretary: isHostelSecretary || false,
      hostelSecretaryPOR: hostelSecretaryPOR || "Student",
      hostel: hostel,
    };
    const docRef=doc(db,STUDENTS_COLLECTION,enrollment);
    await setDoc(docRef,student)
    //const docRef = await addDoc(collectionRef, student);
    res.status(200).json({
      message: "Student registered!",
      student: student,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  checkBodyData(req, next);
  try {
    const { enrollment, password } = req.body;
    if (!enrollment || !password) {
      return res.status(400).json({
        error: "Bad Request",
        message: "enrollment and password are required",
      });
    }
    const collectionRef = collection(db, STUDENTS_COLLECTION);
    const enrollmentQuery = query(
      collectionRef,
      where("enrollment", "==", enrollment)
    );
    const querySnapshot = await getDocs(enrollmentQuery);
    if (querySnapshot.empty) {
      return res.status(404).json({
        error: "User Not Found",
        message: "The user with the provided enrollment does not exist.",
      });
    }
    const studentDoc = querySnapshot.docs[0];
    const student = studentDoc.data();
    const studentPw = student.password;
    const isEqual = await bcrypt.compare(password, studentPw);
    if (!isEqual) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "The provided password is incorrect. Access is denied.",
      });
    }
    const token = jwt.sign(
      {
        enrollment: student.enrollment,
        email: student.email,
        hostel: student.hostel,
        hostelSecretaryPOR: student.hostelSecretaryPOR,
      },
      "mysecretsecret",
      { expiresIn: "30d" }
    );
    return res.status(200).json({
      message: "Logged in!",
      token: token,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
