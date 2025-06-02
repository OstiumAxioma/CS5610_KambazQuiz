import { createSlice } from "@reduxjs/toolkit";
import { enrollments } from "../Database";

const initialState = {
  enrollments: enrollments,
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    addEnrollment: (state, { payload: enrollment }) => {
      const newEnrollment: any = {
        _id: enrollment._id || `enrollment_${Date.now()}`,
        user: enrollment.user,
        course: enrollment.course,
      };
      state.enrollments = [...state.enrollments, newEnrollment] as any;
    },
    removeEnrollment: (state, { payload: enrollmentId }) => {
      state.enrollments = state.enrollments.filter((e: any) => e._id !== enrollmentId);
    },
    removeEnrollmentByUserAndCourse: (state, { payload: { userId, courseId } }) => {
      state.enrollments = state.enrollments.filter((e: any) => 
        !(e.user === userId && e.course === courseId)
      );
    },
    enrollUserInCourse: (state, { payload: { userId, courseId } }) => {
      // Check if enrollment already exists
      const existingEnrollment = state.enrollments.find((e: any) => 
        e.user === userId && e.course === courseId
      );
      
      if (!existingEnrollment) {
        const newEnrollment = {
          _id: `enrollment_${Date.now()}`,
          user: userId,
          course: courseId,
        };
        state.enrollments = [...state.enrollments, newEnrollment] as any;
      }
    },
    unenrollUserFromCourse: (state, { payload: { userId, courseId } }) => {
      state.enrollments = state.enrollments.filter((e: any) => 
        !(e.user === userId && e.course === courseId)
      );
    },
    setEnrollments: (state, { payload: enrollments }) => {
      state.enrollments = enrollments;
    },
  },
});

export const { 
  addEnrollment, 
  removeEnrollment, 
  removeEnrollmentByUserAndCourse,
  enrollUserInCourse,
  unenrollUserFromCourse,
  setEnrollments 
} = enrollmentsSlice.actions;

export default enrollmentsSlice.reducer; 