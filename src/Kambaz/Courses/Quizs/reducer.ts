import { createSlice } from "@reduxjs/toolkit";
import { quizs, questions } from "../../Database";

const initialState = {
  quizs: quizs,
  questions: questions,
};

const quizsSlice = createSlice({
  name: "quizs",
  initialState,
  reducers: {
    addQuiz: (state, { payload: quiz }) => {
      const newQuiz: any = {
        _id: quiz._id || new Date().getTime().toString(),
        title: quiz.title || "New Quiz",
        course: quiz.course,
        description: quiz.description || "",
        points: quiz.points || 100,
        dueDate: quiz.dueDate || "",
        availableFrom: quiz.availableFrom || "",
        availableUntil: quiz.availableUntil || "",
        published: quiz.published || false,
        questions: quiz.questions || 5,
        timeLimit: quiz.timeLimit || 60,
        attempts: quiz.attempts || 1,
      };
      state.quizs = [...state.quizs, newQuiz] as any;
    },
    deleteQuiz: (state, { payload: quizId }) => {
      state.quizs = state.quizs.filter((q: any) => q._id !== quizId);
    },
    updateQuiz: (state, { payload: quiz }) => {
      state.quizs = state.quizs.map((q: any) =>
        q._id === quiz._id ? quiz : q
      ) as any;
    },
    toggleQuizPublish: (state, { payload: quizId }) => {
      state.quizs = state.quizs.map((q: any) =>
        q._id === quizId ? { ...q, published: !q.published } : q
      ) as any;
    },
    editQuiz: (state, { payload: quizId }) => {
      state.quizs = state.quizs.map((q: any) =>
        q._id === quizId ? { ...q, editing: true } : q
      ) as any;
    },
    setQuizs: (state, { payload: quizs }) => {
      state.quizs = quizs;
    },
    addQuestion: (state, { payload: question }) => {
      const newQuestion: any = {
        _id: question._id || new Date().getTime().toString(),
        quizId: question.quizId,
        type: question.type || "multiple-choice",
        title: question.title || "New Question",
        points: question.points || 1,
        question: question.question || "",
        ...question
      };
      state.questions = [...state.questions, newQuestion] as any;
    },
    deleteQuestion: (state, { payload: questionId }) => {
      state.questions = state.questions.filter((q: any) => q._id !== questionId);
    },
    updateQuestion: (state, { payload: question }) => {
      state.questions = state.questions.map((q: any) =>
        q._id === question._id ? question : q
      ) as any;
    },
    setQuestions: (state, { payload: questions }) => {
      state.questions = questions;
    },
  },
});

export const { 
  addQuiz, 
  deleteQuiz, 
  updateQuiz, 
  toggleQuizPublish,
  editQuiz,
  setQuizs,
  addQuestion,
  deleteQuestion,
  updateQuestion,
  setQuestions
} = quizsSlice.actions;

export default quizsSlice.reducer; 