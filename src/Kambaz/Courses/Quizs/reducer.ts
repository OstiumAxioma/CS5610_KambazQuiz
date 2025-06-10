import { createSlice } from "@reduxjs/toolkit";
import { quizs, questions } from "../../Database";

export type QuestionType = "multiple_choice" | "true_false" | "fill_in_blank";

interface Question {
  _id: string;
  type: QuestionType;
  title: string;
  question: string;
  points: number;
  choices?: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  correctOption?: string;
  correctAnswer?: boolean;
  possibleAnswers?: string[];
  quizId?: string;
}

interface Quiz {
  _id: string;
  title: string;
  course: string;
  description?: string;
  points?: number;
  timeLimit?: number;
  attempts?: number;
  questionList: Question[];
  shuffleAnswers?: boolean;
  questionCount?: number;
}

const initialState = {
  quizs: quizs || [],
  questions: questions || [],
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
        questionList: quiz.questionList || [],
        questionCount: quiz.questionList ? quiz.questionList.length : 0,
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
      if (!Array.isArray(state.questions)) {
        state.questions = [];
      }
      const newQuestion: any = {
        _id: question._id || new Date().getTime().toString(),
        quizId: question.quizId,
        type: question.type || "multiple_choice",
        title: question.title || "New Question",
        points: question.points || 1,
        question: question.question || "",
        choices: question.choices || [],
        correctAnswer: question.correctAnswer,
        possibleAnswers: question.possibleAnswers || [],
        ...question
      };
      state.questions = [...state.questions, newQuestion] as any;
    },
    deleteQuestion: (state, { payload: questionId }) => {
      if (!Array.isArray(state.questions)) {
        state.questions = [];
      }
      state.questions = state.questions.filter((q: any) => q._id !== questionId);
    },
    updateQuestion: (state, { payload: question }) => {
      if (!Array.isArray(state.questions)) {
        state.questions = [];
      }
      state.questions = state.questions.map((q: any) =>
        q._id === question._id ? question : q
      ) as any;
    },
    setQuestions: (state, { payload: questions }) => {
      state.questions = questions || [];
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

const validateQuestion = (question: Question) => {
  switch (question.type) {
    case "multiple_choice":
      return (
        question.choices &&
        question.choices.length >= 2 &&
        question.correctOption &&
        question.choices.some(opt => opt.id === question.correctOption)
      );
    case "true_false":
      return typeof question.correctAnswer === "boolean";
    case "fill_in_blank":
      return (
        question.possibleAnswers &&
        question.possibleAnswers.length > 0 &&
        question.possibleAnswers.every(ans => ans.trim() !== "")
      );
    default:
      return false;
  }
};

export default quizsSlice.reducer; 