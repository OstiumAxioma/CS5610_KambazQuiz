import { createSlice } from "@reduxjs/toolkit";
import { quizAttempts } from "../../Database";

const initialState = {
  quizAttempts: quizAttempts,
};

const quizAttemptsSlice = createSlice({
  name: "quizAttempts",
  initialState,
  reducers: {
    addQuizAttempt: (state, { payload: attempt }) => {
      const newAttempt = {
        _id: new Date().getTime().toString(),
        quiz: attempt.quiz,
        user: attempt.user,
        startTime: attempt.startTime || new Date().toISOString(),
        endTime: attempt.endTime || null,
        score: attempt.score || 0,
        totalPoints: attempt.totalPoints || 0,
        answers: attempt.answers || [],
        attemptNumber: attempt.attemptNumber || 1
      };
      state.quizAttempts = [...state.quizAttempts, newAttempt] as any;
    },
    updateQuizAttempt: (state, { payload: attempt }) => {
      state.quizAttempts = state.quizAttempts.map((a: any) =>
        a._id === attempt._id ? attempt : a
      ) as any;
    },
    deleteQuizAttempt: (state, { payload: attemptId }) => {
      state.quizAttempts = state.quizAttempts.filter((a: any) => a._id !== attemptId);
    },
    submitQuizAttempt: (state, { payload: { attemptId, answers, score, totalPoints } }) => {
      state.quizAttempts = state.quizAttempts.map((a: any) =>
        a._id === attemptId ? {
          ...a,
          endTime: new Date().toISOString(),
          answers,
          score,
          totalPoints
        } : a
      ) as any;
    },
    updateQuizAttemptAnswers: (state, { payload: { attemptId, questionId, userAnswer } }) => {
      state.quizAttempts = state.quizAttempts.map((a: any) => {
        if (a._id === attemptId) {
          const existingAnswerIndex = a.answers.findIndex((ans: any) => ans.questionId === questionId);
          
          if (existingAnswerIndex >= 0) {
            const updatedAnswers = [...a.answers];
            updatedAnswers[existingAnswerIndex] = {
              ...updatedAnswers[existingAnswerIndex],
              userAnswer
            };
            return { ...a, answers: updatedAnswers };
          } else {
            return {
              ...a,
              answers: [...a.answers, { questionId, userAnswer, isCorrect: false }]
            };
          }
        }
        return a;
      }) as any;
    },
    clearQuizAttemptsForUser: (state, { payload: { userId, quizId } }) => {
      state.quizAttempts = state.quizAttempts.filter((a: any) => 
        !(a.user === userId && a.quiz === quizId)
      );
    },
    clearAllQuizAttempts: (state) => {
      state.quizAttempts = [];
    }
  },
});

export const {
  addQuizAttempt,
  updateQuizAttempt,
  deleteQuizAttempt,
  submitQuizAttempt,
  updateQuizAttemptAnswers,
  clearQuizAttemptsForUser,
  clearAllQuizAttempts
} = quizAttemptsSlice.actions;

export default quizAttemptsSlice.reducer;