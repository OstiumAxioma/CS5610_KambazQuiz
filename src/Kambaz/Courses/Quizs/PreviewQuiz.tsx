import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Card, Form, Badge, ProgressBar, Alert } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { addQuizAttempt, submitQuizAttempt, updateQuizAttemptAnswers } from "./quizAttemptsReducer";

interface Question {
  _id: string;
  type: string;
  title: string;
  questionText: string;
  points: number;
  options?: {
    id: string;
    text: string;
  }[];
  correctOption?: string;
  correctAnswer?: boolean;
  possibleAnswers?: string[];
}

interface Quiz {
  _id: string;
  title: string;
  course: string;
  description?: string;
  points?: number;
  timeLimit?: number;
  attempts?: number;
  questionList?: Question[];
  shuffleAnswers?: boolean;
  questions?: number;
}

interface QuizAttempt {
  _id: string;
  quiz: string;
  user: string;
  startTime: string;
  endTime?: string;
  score: number;
  totalPoints: number;
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  attemptNumber: number;
}

export default function PreviewQuiz() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const dispatch = useDispatch();
  const { quizs } = useSelector((state: any) => state.quizsReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { quizAttempts } = useSelector((state: any) => state.quizAttemptsReducer);
  

  const queryParams = new URLSearchParams(location.search);
  const viewAttemptId = queryParams.get('viewAttempt'); 
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{score: number, totalPoints: number, correctAnswers: number}>({ score: 0, totalPoints: 0, correctAnswers: 0 });
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [quizStarted, setQuizStarted] = useState(false); 

  const [calculatedTotalPoints, setCalculatedTotalPoints] = useState<number>(0);
  const [calculatedQuestionCount, setCalculatedQuestionCount] = useState<number>(0);

  const isFaculty = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const isStudent = currentUser?.role === "STUDENT";

  useEffect(() => {
    if (quiz && quiz.questionList && quiz.questionList.length > 0) {
      const totalPoints = quiz.questionList.reduce((sum: number, q: Question) => sum + (q.points || 0), 0);
      setCalculatedTotalPoints(totalPoints);
      setCalculatedQuestionCount(quiz.questionList.length);
    } else if (quiz) {
      setCalculatedTotalPoints(quiz.points || 0);
      setCalculatedQuestionCount(quiz.questions || 0);
    }
  }, [quiz]);

  useEffect(() => {
    const foundQuiz = quizs.find((q: Quiz) => q._id === qid);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      
      if (isStudent) {
        console.log("检查用户尝试 - 当前用户:", currentUser._id);
        console.log("检查用户尝试 - 当前测验:", qid);
        console.log("所有测验尝试:", quizAttempts);
        console.log("查询参数 viewAttemptId:", viewAttemptId);
        
        if (viewAttemptId) {
          const specificAttempt = quizAttempts.find((a: QuizAttempt) => 
            a._id === viewAttemptId && a.user === currentUser._id && a.quiz === qid
          );
          
          if (specificAttempt && specificAttempt.endTime) {
            console.log("找到指定的尝试:", specificAttempt);
            setAttempt(specificAttempt);
            setIsSubmitted(true);
            
            const answerMap: {[key: string]: string} = {};
            specificAttempt.answers.forEach((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => {
              answerMap[a.questionId] = a.userAnswer;
            });
            setAnswers(answerMap);
            
            setResults({
              score: specificAttempt.score,
              totalPoints: specificAttempt.totalPoints,
              correctAnswers: specificAttempt.answers.filter((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => a.isCorrect).length
            });
            
            setQuizStarted(true);
            return;
          }
        }
        
        const completedUserAttempts = quizAttempts.filter((a: QuizAttempt) => 
          a.quiz === qid && a.user === currentUser._id && a.endTime
        );
        
        console.log("该用户对该测验的已完成尝试:", completedUserAttempts);
        console.log("最大允许尝试次数:", foundQuiz.attempts || 1);
        
        const sortedAttempts = [...completedUserAttempts].sort((a: QuizAttempt, b: QuizAttempt) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        if (completedUserAttempts.length > 0) {
          if (completedUserAttempts.length >= (foundQuiz.attempts || 1)) {
            setErrorMessage(`You have already used all ${foundQuiz.attempts} allowed attempts for this quiz.`);
            
            if (sortedAttempts.length > 0) {
              setAttempt(sortedAttempts[0]);
              setIsSubmitted(true);
              
              // Load previous answers
              const answerMap: {[key: string]: string} = {};
              sortedAttempts[0].answers.forEach((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => {
                answerMap[a.questionId] = a.userAnswer;
              });
              setAnswers(answerMap);
              
              // Set results
              setResults({
                score: sortedAttempts[0].score,
                totalPoints: sortedAttempts[0].totalPoints,
                correctAnswers: sortedAttempts[0].answers.filter((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => a.isCorrect).length
              });
            }
            return;
          } else {
            console.log("有已完成的尝试，但尝试次数未用完。添加查看上次尝试结果的选项");
            setAttempt(sortedAttempts[0]); 
          }
        }
        
        const incompleteAttempts = quizAttempts.filter((a: QuizAttempt) => 
          a.quiz === qid && a.user === currentUser._id && !a.endTime
        );

        if (incompleteAttempts.length > 0) {
          console.log("找到未完成的尝试，恢复它:", incompleteAttempts[0]);
          setAttempt(incompleteAttempts[0]);

          if (incompleteAttempts[0].answers && incompleteAttempts[0].answers.length > 0) {
            console.log("恢复先前保存的答案:", incompleteAttempts[0].answers);
            const answerMap: {[key: string]: string} = {};
            incompleteAttempts[0].answers.forEach((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => {
              answerMap[a.questionId] = a.userAnswer;
            });
            setAnswers(answerMap);
          }

          if (foundQuiz.timeLimit && foundQuiz.timeLimit > 0) {
            const startTime = new Date(incompleteAttempts[0].startTime).getTime();
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const totalSeconds = foundQuiz.timeLimit * 60;
            const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
            
            if (remainingSeconds > 0) {
              setTimeLeft(remainingSeconds);
            } else {
              handleSubmit();
            }
          }
          
          setQuizStarted(true);
        }
      }
    }
  }, [qid, quizs, currentUser, quizAttempts, isStudent, viewAttemptId, dispatch]);

  const handleStartQuiz = () => {
    if (!quiz || !isStudent) return;
    
    console.log("学生开始测验");
    
    const userAttempts = quizAttempts.filter((a: QuizAttempt) => 
      a.quiz === qid && a.user === currentUser._id
    );
    
    const newAttemptData = {
      quiz: qid,
      user: currentUser._id,
      startTime: new Date().toISOString(),
      score: 0,
      totalPoints: calculatedTotalPoints, 
      answers: [],
      attemptNumber: userAttempts.length + 1
    };
    
    dispatch(addQuizAttempt(newAttemptData));
    console.log("创建新的测验尝试:", newAttemptData);
    
    if (quiz.timeLimit && quiz.timeLimit > 0) {
      setTimeLeft(quiz.timeLimit * 60); 
    }
    
    setQuizStarted(true);
  };

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;
    
    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(intervalId);
          handleSubmit();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
    
    setTimer(intervalId);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleNextQuestion = () => {
    if (!quiz || !quiz.questionList) return;
    
    if (currentQuestionIndex < quiz.questionList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    
    if (isStudent && !isSubmitted) {
      const currentAttempt = quizAttempts.find((a: QuizAttempt) => 
        a.quiz === qid && a.user === currentUser._id && !a.endTime
      );
      
      if (currentAttempt) {
        console.log("实时保存答案:", { attemptId: currentAttempt._id, questionId, userAnswer: answer });
        dispatch(updateQuizAttemptAnswers({
          attemptId: currentAttempt._id,
          questionId,
          userAnswer: answer
        }));
      }
    }
  };

  const calculateResults = () => {
    if (!quiz || !quiz.questionList) return { score: 0, totalPoints: 0, correctAnswers: 0 };
    
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const answersList: {
      questionId: string;
      userAnswer: string;
      isCorrect: boolean;
    }[] = [];
    
    for (const question of quiz.questionList) {
      totalPoints += question.points;
      
      const userAnswer = answers[question._id] || "";
      let isCorrect = false;
      
      if (question.type === "multiple_choice") {
        isCorrect = userAnswer === question.correctOption;
      } else if (question.type === "true_false") {
        isCorrect = (userAnswer === "true" && question.correctAnswer === true) || 
                   (userAnswer === "false" && question.correctAnswer === false);
      } else if (question.type === "fill_in_blank") {
        isCorrect = question.possibleAnswers?.some(
          answer => answer.toLowerCase() === userAnswer.toLowerCase()
        ) || false;
      }
      
      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }
      
      answersList.push({
        questionId: question._id,
        userAnswer,
        isCorrect
      });
    }
    
    return {
      score: earnedPoints,
      totalPoints,
      correctAnswers: correctCount,
      answersList
    };
  };

  const handleSubmit = () => {
    if (timer) clearInterval(timer);
    
    const { score, totalPoints, correctAnswers, answersList } = calculateResults();
    setResults({ score, totalPoints, correctAnswers });
    
    if (isStudent) {
      const userAttempts = quizAttempts.filter((a: QuizAttempt) => 
        a.quiz === qid && a.user === currentUser._id && !a.endTime
      );
      
      if (userAttempts.length > 0) {
        dispatch(submitQuizAttempt({
          attemptId: userAttempts[0]._id,
          answers: answersList,
          score,
          totalPoints: calculatedTotalPoints, 
        }));
        console.log("提交测验尝试:", {
          attemptId: userAttempts[0]._id,
          answers: answersList,
          score,
          totalPoints: calculatedTotalPoints
        });
      }
    }
    
    setIsSubmitted(true);
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const renderQuestion = () => {
    if (!quiz || !quiz.questionList || quiz.questionList.length === 0) {
      return <Alert variant="warning">This quiz has no questions.</Alert>;
    }
    
    const question = quiz.questionList[currentQuestionIndex];
    
    if (!question) return null;
    
    const userAnswer = answers[question._id] || "";
    
    // When the quiz is submitted, show if the answer is correct or not
    let isCorrect = false;
    if (isSubmitted) {
      if (question.type === "multiple_choice") {
        isCorrect = userAnswer === question.correctOption;
      } else if (question.type === "true_false") {
        isCorrect = (userAnswer === "true" && question.correctAnswer === true) || 
                   (userAnswer === "false" && question.correctAnswer === false);
      } else if (question.type === "fill_in_blank") {
        isCorrect = question.possibleAnswers?.some(
          answer => answer.toLowerCase() === userAnswer.toLowerCase()
        ) || false;
      }
    }
    
    return (
      <Card className="quiz-question mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">{question.title}</h5>
            <div className="small text-muted">{question.points} points</div>
          </div>
          {isSubmitted && (
            <div>
              {isCorrect ? (
                <FaCheckCircle className="text-success fs-4" />
              ) : (
                <FaTimesCircle className="text-danger fs-4" />
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body>
          <div className="question-text mb-4">{question.questionText}</div>
          
          {question.type === "multiple_choice" && (
            <Form>
              {question.options?.map((option) => (
                <Form.Check
                  key={option.id}
                  type="radio"
                  id={`option-${question._id}-${option.id}`}
                  label={option.text}
                  name={`question-${question._id}`}
                  value={option.id}
                  checked={userAnswer === option.id}
                  onChange={() => handleAnswerChange(question._id, option.id)}
                  disabled={isSubmitted}
                  className={isSubmitted ? (
                    // 对学生隐藏正确答案
                    isFaculty ? 
                      (option.id === question.correctOption 
                        ? "text-success fw-bold" 
                        : userAnswer === option.id ? "text-danger" : "")
                      : (userAnswer === option.id 
                        ? (isCorrect ? "text-success fw-bold" : "text-danger") 
                        : "")
                  ) : ""}
                />
              ))}
            </Form>
          )}
          
          {question.type === "true_false" && (
            <Form>
              <Form.Check
                type="radio"
                id={`true-${question._id}`}
                label="True"
                name={`question-${question._id}`}
                value="true"
                checked={userAnswer === "true"}
                onChange={() => handleAnswerChange(question._id, "true")}
                disabled={isSubmitted}
                className={isSubmitted ? (
                  // 对学生隐藏正确答案
                  isFaculty ? 
                    (question.correctAnswer === true
                      ? "text-success fw-bold"
                      : userAnswer === "true" ? "text-danger" : "")
                    : (userAnswer === "true" 
                      ? (isCorrect ? "text-success fw-bold" : "text-danger") 
                      : "")
                ) : ""}
              />
              <Form.Check
                type="radio"
                id={`false-${question._id}`}
                label="False"
                name={`question-${question._id}`}
                value="false"
                checked={userAnswer === "false"}
                onChange={() => handleAnswerChange(question._id, "false")}
                disabled={isSubmitted}
                className={isSubmitted ? (
                  // 对学生隐藏正确答案
                  isFaculty ? 
                    (question.correctAnswer === false
                      ? "text-success fw-bold"
                      : userAnswer === "false" ? "text-danger" : "")
                    : (userAnswer === "false" 
                      ? (isCorrect ? "text-success fw-bold" : "text-danger") 
                      : "")
                ) : ""}
              />
            </Form>
          )}
          
          {question.type === "fill_in_blank" && (
            <Form>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Your answer..."
                  value={userAnswer}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  disabled={isSubmitted}
                  className={isSubmitted ? (
                    isCorrect ? "border-success" : "border-danger"
                  ) : ""}
                />
                {isSubmitted && isFaculty && (
                  <div className="mt-2">
                    <strong className="text-success">Correct answer(s): </strong> 
                    {question.possibleAnswers?.join(", ")}
                  </div>
                )}
                {isSubmitted && !isFaculty && isCorrect && (
                  <div className="mt-2 text-success">
                    <strong>Your answer is correct!</strong>
                  </div>
                )}
                {isSubmitted && !isFaculty && !isCorrect && (
                  <div className="mt-2 text-danger">
                    <strong>Your answer is incorrect.</strong>
                  </div>
                )}
              </Form.Group>
            </Form>
          )}
        </Card.Body>
      </Card>
    );
  };

  if (!quiz) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (errorMessage) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">{errorMessage}</Alert>
        {attempt && (
          <Card className="mt-4">
            <Card.Header>
              <h4>Your Previous Attempt Results</h4>
            </Card.Header>
            <Card.Body>
              <h5>Score: {attempt.score} / {attempt.totalPoints}</h5>
              <p>Completed on: {new Date(attempt.endTime || "").toLocaleString()}</p>
              <p>Attempt: {attempt.attemptNumber} of {quiz.attempts}</p>
              
              <Button 
                variant="primary" 
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs`)}
              >
                Back to Quizzes
              </Button>
            </Card.Body>
          </Card>
        )}
      </div>
    );
  }

  // 如果是学生且测验未开始，显示开始测验按钮
  if (isStudent && !quizStarted && !isSubmitted) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{quiz.title}</h2>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs`)}
          >
            Back to Quizzes
          </Button>
        </div>
        
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Quiz Information</Card.Title>
            <Card.Text>{quiz.description || "Answer all questions to the best of your ability."}</Card.Text>
            <div className="d-flex justify-content-between mb-3">
              <div><strong>Time limit:</strong> {quiz.timeLimit} minutes</div>
              <div><strong>Points:</strong> {calculatedTotalPoints}</div>
              <div><strong>Questions:</strong> {calculatedQuestionCount}</div>
            </div>
            <div className="mb-3">
              <strong>Attempts allowed:</strong> {quiz.attempts || 1}
            </div>
            
            {/* 显示最近一次尝试的结果（如果有） */}
            {attempt && attempt.endTime && (
              <div className="mb-4">
                <h5>Your Last Attempt Result:</h5>
                <div className="d-flex justify-content-between border p-3 rounded bg-light">
                  <div>
                    <div><strong>Score:</strong> {attempt.score} / {attempt.totalPoints}</div>
                    <div><strong>Completed on:</strong> {new Date(attempt.endTime).toLocaleString()}</div>
                    <div><strong>Attempt:</strong> {attempt.attemptNumber} of {quiz.attempts}</div>
                  </div>
                  <div>
                    <Button 
                      variant="info" 
                      onClick={() => {
                        // 加载这次尝试的答案和结果，并标记为已提交
                        const answerMap: {[key: string]: string} = {};
                        attempt.answers.forEach((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => {
                          answerMap[a.questionId] = a.userAnswer;
                        });
                        setAnswers(answerMap);
                        
                        setResults({
                          score: attempt.score,
                          totalPoints: attempt.totalPoints,
                          correctAnswers: attempt.answers.filter((a: {questionId: string, userAnswer: string, isCorrect: boolean}) => a.isCorrect).length
                        });
                        
                        setIsSubmitted(true);
                        setQuizStarted(true);
                      }}
                    >
                      View Last Attempt
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <Alert variant="info">
              <strong>Important:</strong> Once you click "Start Quiz", the timer will begin and your attempt will be recorded. 
              Make sure you have enough time to complete the quiz before starting.
            </Alert>
            <div className="text-center">
              <Button 
                variant="success" 
                size="lg"
                onClick={handleStartQuiz}
              >
                Start Quiz
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title} {isFaculty && <Badge bg="warning">Preview Mode</Badge>}</h2>
        <Button 
          variant="secondary" 
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs`)}
        >
          {isFaculty ? "Exit Preview" : "Back to Quizzes"}
        </Button>
      </div>
      
      {timeLeft !== null && !isSubmitted && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center">
          <span>Time Remaining: {formatTime(timeLeft)}</span>
          <ProgressBar 
            now={(timeLeft / (quiz.timeLimit || 60) * 60) * 100} 
            variant={timeLeft < 60 ? "danger" : timeLeft < 300 ? "warning" : "info"} 
            style={{width: "70%"}}
          />
        </Alert>
      )}
      
      {isSubmitted ? (
        <div className="results-container">
          <Alert variant={results.score > (results.totalPoints / 2) ? "success" : "warning"}>
            <Alert.Heading>Quiz Results</Alert.Heading>
            <p>You scored {results.score} out of {calculatedTotalPoints || results.totalPoints} points.</p>
            <p>Correct answers: {results.correctAnswers} of {calculatedQuestionCount || quiz.questionList?.length || 0} questions.</p>
            <p>Percentage: {Math.round((results.score / (calculatedTotalPoints || results.totalPoints || 1)) * 100)}%</p>
            
            {isStudent && (
              <p>
                <small>
                  {quiz.attempts && quiz.attempts > 1 ? 
                    `You've used ${
                      quizAttempts.filter(
                        (a: QuizAttempt) => a.quiz === qid && a.user === currentUser._id && a.endTime
                      ).length
                    } of ${quiz.attempts} allowed attempts.` : 
                    "You cannot retake this quiz."
                  }
                </small>
              </p>
            )}
          </Alert>
          
          <div className="text-center mb-4">
            <Button 
              variant="primary" 
              onClick={() => setCurrentQuestionIndex(0)}
            >
              Review Questions
            </Button>
          </div>
        </div>
      ) : (
        <div className="quiz-description mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Instructions</Card.Title>
              <Card.Text>{quiz.description || "Answer all questions to the best of your ability."}</Card.Text>
              <div className="d-flex justify-content-between">
                <div>Time limit: {quiz.timeLimit} minutes</div>
                <div>Points: {calculatedTotalPoints}</div>
                <div>Questions: {calculatedQuestionCount}</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
      
      <div className="d-flex justify-content-center mb-4 flex-wrap">
        {quiz.questionList?.map((_, index) => (
          <Button
            key={index}
            variant={
              index === currentQuestionIndex 
                ? "primary" 
                : answers[quiz.questionList?.[index]._id!] !== undefined
                  ? isSubmitted ? "success" : "info"
                  : "outline-secondary"
            }
            className="m-1"
            onClick={() => handleJumpToQuestion(index)}
            size="sm"
          >
            {index + 1}
          </Button>
        ))}
      </div>
      
      {renderQuestion()}
      
      <div className="d-flex justify-content-between mt-4">
        <Button 
          variant="secondary" 
          onClick={handlePrevQuestion} 
          disabled={currentQuestionIndex === 0}
        >
          <FaArrowLeft className="me-1" /> Previous
        </Button>
        
        <div>
          {!isSubmitted && (
            <Button 
              variant="success" 
              onClick={handleSubmit}
              className="me-2"
            >
              Submit Quiz
            </Button>
          )}
          
          {currentQuestionIndex < (quiz.questionList?.length || 0) - 1 ? (
            <Button variant="primary" onClick={handleNextQuestion}>
              Next <FaArrowRight className="ms-1" />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setCurrentQuestionIndex(0)} 
              className={isSubmitted ? "" : "d-none"}
            >
              Back to First Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}