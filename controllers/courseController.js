import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});

export const createCourse = catchAsyncError(async (req, res, next) => {
  // if (!title || !description || !category || !createdBy)
  // return next(new ErrorHandler("Please fill all the feilds", 400));
  const { title, description, category, createdBy } = req.body;

  const file = req.files?.courseCoverImage[0];

  // console.log(file);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: "temp",
      url: "temp",
    },
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully. You can add lectures later",
    course: createCourse,
  });
});

export const addLectureToCourse = catchAsyncError(async (req, res, next) => {
  const courseId = req.params.id;
  const { title, description } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const existingLecture = course.lectures.find(
    (lecture) => lecture.title === title
  );

  if (existingLecture) {
    return next(new ErrorHandler("Lecture already exists in the course", 400));
  }

  var lectureId = new mongoose.Types.ObjectId(); // Generating the New Id for the Lectures
  course.lectures.push({
    lectureId,
    title,
    description,
  });

  course.numVideos += 1;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture added to the course successfully",
  });
});

export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  course.views += 1;
  await course.save();

  res.status(200).json({
    success: true,
    course,
  });
});

export const getAllCoursesAvailable = catchAsyncError(
  async (req, res, next) => {
    const courses = await Course.find();

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No courses found" });
    }

    res.status(200).json({ success: true, courses });
  }
);
