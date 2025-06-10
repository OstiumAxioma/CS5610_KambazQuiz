import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Badge, Table, Row, Col } from "react-bootstrap";
import { FaEdit, FaCheckCircle, FaBan, FaEye } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleQuizPublish } from "./reducer";

// Define interfaces for type checking
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
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  published?: boolean;
  questions?: number;
  timeLimit?: number;
  attempts?: number;
  questionList?: Question[];
  shuffleAnswers?: boolean;
  quizType?: string;
  assignmentGroup?: string;
  multipleAttempts?: boolean;
  showCorrectAnswers?: string;
  accessCode?: string;
  oneQuestionAtTime?: boolean;
  webcamRequired?: boolean;
  lockQuestionsAfterAnswering?: boolean;
  viewResponses?: string;
  requireResponsiveLockDown?: boolean;
  requireQuizResults?: boolean;
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

export default function QuizDetail() {
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizs } = useSelector((state: any) => state.quizsReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { quizAttempts } = useSelector((state: any) => state.quizAttemptsReducer);
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  
  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const isStudent = currentUser?.role === "STUDENT";

  useEffect(() => {
    if (!qid) return;
    
    const foundQuiz = quizs.find((q: Quiz) => q._id === qid);
    if (foundQuiz) {
      // Initialize default properties if they don't exist
      const quizWithDefaults: Quiz = {
        ...foundQuiz,
        quizType: foundQuiz.quizType || "Graded Quiz",
        assignmentGroup: foundQuiz.assignmentGroup || "Quizzes",
        shuffleAnswers: foundQuiz.shuffleAnswers !== undefined ? foundQuiz.shuffleAnswers : true,
        timeLimit: foundQuiz.timeLimit || 30,
        multipleAttempts: foundQuiz.multipleAttempts !== undefined ? foundQuiz.multipleAttempts : false,
        attempts: foundQuiz.attempts || 1,
        showCorrectAnswers: foundQuiz.showCorrectAnswers || "Immediately",
        accessCode: foundQuiz.accessCode || "",
        oneQuestionAtTime: foundQuiz.oneQuestionAtTime !== undefined ? foundQuiz.oneQuestionAtTime : true,
        webcamRequired: foundQuiz.webcamRequired !== undefined ? foundQuiz.webcamRequired : false,
        lockQuestionsAfterAnswering: foundQuiz.lockQuestionsAfterAnswering !== undefined ? foundQuiz.lockQuestionsAfterAnswering : false,
        viewResponses: foundQuiz.viewResponses || "Always",
        requireResponsiveLockDown: foundQuiz.requireResponsiveLockDown !== undefined ? foundQuiz.requireResponsiveLockDown : false,
        requireQuizResults: foundQuiz.requireQuizResults !== undefined ? foundQuiz.requireQuizResults : false,
      };
      
      setQuiz(quizWithDefaults);
      
      // Find user attempts for this quiz
      if (currentUser) {
        const attempts = quizAttempts.filter(
          (a: QuizAttempt) => a.quiz === qid && a.user === currentUser._id
        );
        setUserAttempts(attempts);
        
        // Find latest completed attempt
        const completedAttempts = attempts.filter((a: QuizAttempt) => a.endTime);
        if (completedAttempts.length > 0) {
          const sortedAttempts = [...completedAttempts].sort((a, b) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
          setLatestAttempt(sortedAttempts[0]);
        }
      }
    }
  }, [qid, quizs, currentUser, quizAttempts]);

  const handlePublishToggle = () => {
    if (quiz) {
      dispatch(toggleQuizPublish(quiz._id));
    }
  };

  const getTotalPoints = (): number => {
    if (!quiz) return 0;
    
    if (quiz.questionList && quiz.questionList.length > 0) {
      return quiz.questionList.reduce((sum: number, q: Question) => sum + (q.points || 0), 0);
    }
    
    return quiz.points || 0;
  };

  // Check if the student can take the quiz
  const canTakeQuiz: boolean = (() => {
    if (!quiz || !isStudent) return false;
    
    // Check if the quiz is published
    if (!quiz.published) return false;
    
    // Check availability dates
    const now = new Date();
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;
    
    if (availableFrom && now < availableFrom) return false;
    if (availableUntil && now > availableUntil) return false;
    
    // Check if user has any attempts left
    const completedAttempts = userAttempts.filter(a => a.endTime);
    
    // If multipleAttempts is false, only allow one attempt
    if (!quiz.multipleAttempts && completedAttempts.length > 0) return false;
    
    // If multipleAttempts is true, check if user has used all attempts
    const maxAttempts = quiz.attempts || 1;
    return completedAttempts.length < maxAttempts;
  })();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  if (!quiz) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          {quiz.title} 
          {!quiz.published && <Badge bg="secondary" className="ms-2">Unpublished</Badge>}
        </h2>
        <div>
          {canEdit && (
            <>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
              >
                <FaEye className="me-1" /> Preview
              </Button>
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/edit`)}
              >
                <FaEdit className="me-1" /> Edit
              </Button>
            </>
          )}
          {/* Only show Take Quiz button here if there are no previous attempts */}
          {isStudent && canTakeQuiz && userAttempts.length === 0 && (
            <Button 
              variant="success"
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
            >
              Take Quiz
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Q1 - {quiz.title}</h5>
          {canEdit && (
            <Button 
              variant={quiz.published ? "outline-danger" : "outline-success"}
              size="sm"
              onClick={handlePublishToggle}
            >
              {quiz.published ? (
                <>
                  <FaBan className="me-1" /> Unpublish
                </>
              ) : (
                <>
                  <FaCheckCircle className="me-1" /> Publish
                </>
              )}
            </Button>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          <Table className="mb-0" hover>
            <tbody>
              <tr>
                <td width="30%" className="ps-3 py-2">Quiz Type</td>
                <td width="70%" className="py-2">{quiz.quizType || "Graded Quiz"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Points</td>
                <td className="py-2">{getTotalPoints()}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Assignment Group</td>
                <td className="py-2">{quiz.assignmentGroup || "Quizzes"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Shuffle Answers</td>
                <td className="py-2">{quiz.shuffleAnswers ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Time Limit</td>
                <td className="py-2">{quiz.timeLimit || 30} Minutes</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Multiple Attempts</td>
                <td className="py-2">{quiz.multipleAttempts ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Allowed Attempts</td>
                <td className="py-2">{quiz.attempts || 1}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">View Responses</td>
                <td className="py-2">{quiz.viewResponses || "Always"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Show Correct Answers</td>
                <td className="py-2">{quiz.showCorrectAnswers || "Immediately"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Access Code</td>
                <td className="py-2">{quiz.accessCode || " "}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">One Question at a Time</td>
                <td className="py-2">{quiz.oneQuestionAtTime ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Require Responsive LockDown</td>
                <td className="py-2">{quiz.requireResponsiveLockDown ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Required to View Quiz Results</td>
                <td className="py-2">{quiz.requireQuizResults ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Webcam Required</td>
                <td className="py-2">{quiz.webcamRequired ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="ps-3 py-2">Lock Questions After Answering</td>
                <td className="py-2">{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </Table>
          
          <Table className="mb-0 border-top" hover>
            <thead>
              <tr className="table-light">
                <th className="ps-3 py-2">Due</th>
                <th className="py-2">For</th>
                <th className="py-2">Available from</th>
                <th className="py-2">Until</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ps-3 py-2">{formatDate(quiz.dueDate)}</td>
                <td className="py-2">Everyone</td>
                <td className="py-2">{formatDate(quiz.availableFrom)}</td>
                <td className="py-2">{formatDate(quiz.availableUntil)}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {isStudent && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Your Quiz Status</h5>
              </Card.Header>
              <Card.Body>
                {userAttempts.length > 0 ? (
                  <>
                    {/* Show all attempts in a table */}
                    <h6>All Attempts</h6>
                    <Table bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Score</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAttempts
                          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                          .map((attempt, index) => (
                            <tr key={attempt._id}>
                              <td>{attempt.attemptNumber}</td>
                              <td>{new Date(attempt.startTime).toLocaleDateString()}</td>
                              <td>
                                {attempt.endTime ? 
                                  `${attempt.score}/${attempt.totalPoints} (${Math.round((attempt.score / attempt.totalPoints) * 100)}%)` : 
                                  "In progress"}
                              </td>
                              <td>
                                {attempt.endTime ? 
                                  <Badge bg="success">Completed</Badge> : 
                                  <Badge bg="warning">In progress</Badge>}
                              </td>
                              <td>
                                {attempt.endTime ? (
                                  index === 0 ? (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview?viewAttempt=${attempt._id}`)}
                                    >
                                      View Results
                                    </Button>
                                  ) : (
                                    <span className="text-muted small">Results unavailable</span>
                                  )
                                ) : (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
                                  >
                                    Continue
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                    
                    {/* If student can take another attempt, show the Start New Attempt button */}
                    {canTakeQuiz && (
                      <div className="d-grid mt-3">
                        <Button 
                          variant="success"
                          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
                        >
                          Start New Attempt
                        </Button>
                      </div>
                    )}
                    
                    {/* Show attempt count information */}
                    {quiz.multipleAttempts && (
                      <div className="text-muted mt-2 text-center">
                        <small>You have used {userAttempts.filter(a => a.endTime).length} of {quiz.attempts} allowed attempts.</small>
                      </div>
                    )}
                    
                    {/* Section for showing the latest attempt's detailed answers if available */}
                    {latestAttempt && latestAttempt.endTime && (
                      <div className="mt-4">
                        <h6>Latest Attempt Details</h6>
                        <div className="card p-3 bg-light">
                          <div className="d-flex justify-content-between mb-3">
                            <div>
                              <strong>Date:</strong> {new Date(latestAttempt.startTime).toLocaleString()}
                            </div>
                            <div>
                              <strong>Score:</strong> {latestAttempt.score}/{latestAttempt.totalPoints} 
                              ({Math.round((latestAttempt.score / latestAttempt.totalPoints) * 100)}%)
                            </div>
                          </div>
                          
                          {latestAttempt.answers && latestAttempt.answers.length > 0 ? (
                            <div>
                              <h6>Question Results:</h6>
                              <Table bordered size="sm">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Answer</th>
                                    <th>Result</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {latestAttempt.answers.map((answer, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>
                                        {answer.userAnswer || <em>No answer</em>}
                                      </td>
                                      <td>
                                        {answer.isCorrect ? 
                                          <Badge bg="success">Correct</Badge> : 
                                          <Badge bg="danger">Incorrect</Badge>}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                              <div className="text-center mt-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview?viewAttempt=${latestAttempt._id}`)}
                                >
                                  View Detailed Results
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p>No detailed answer information available.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : canTakeQuiz ? (
                  <div className="text-center">
                    <p>You haven't attempted this quiz yet.</p>
                    <Button 
                      variant="success"
                      onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
                    >
                      Start Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p>This quiz is not currently available.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      <div className="d-flex justify-content-between">
        <Link to={`/Kambaz/Courses/${cid}/Quizs`}>
          <Button variant="secondary">Back to Quizzes</Button>
        </Link>
      </div>
    </div>
  );
}