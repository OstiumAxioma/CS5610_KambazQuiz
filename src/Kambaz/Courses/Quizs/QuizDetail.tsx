import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Badge, Alert, ListGroup } from "react-bootstrap";
import { FaEdit, FaCheckCircle, FaBan, FaClock, FaCalendarAlt, FaList } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleQuizPublish } from "./reducer";

interface QuizAttempt {
  _id: string;
  quiz: string;
  user: string;
  startTime: string;
  endTime?: string;
  score: number;
  totalPoints: number;
  attemptNumber: number;
}

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
}

export default function QuizDetail() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizs } = useSelector((state: any) => state.quizsReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { quizAttempts } = useSelector((state: any) => state.quizAttemptsReducer);
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  
  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const isStudent = currentUser?.role === "STUDENT";

  useEffect(() => {
    const foundQuiz = quizs.find((q: Quiz) => q._id === qid);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      
      // Calculate total points from question list if available
      if (foundQuiz.questionList && foundQuiz.questionList.length > 0) {
        const calcTotalPoints = foundQuiz.questionList.reduce((sum: number, q: Question) => sum + (q.points || 0), 0);
        setTotalPoints(calcTotalPoints);
        setQuestionCount(foundQuiz.questionList.length);
      } else {
        // Use the points and questions properties if questionList is not available
        setTotalPoints(foundQuiz.points || 0);
        setQuestionCount(foundQuiz.questions || 0);
      }
      
      // Find user attempts for this quiz
      if (currentUser) {
        const attempts = quizAttempts.filter(
          (a: QuizAttempt) => a.quiz === qid && a.user === currentUser._id
        );
        setUserAttempts(attempts);
        
        // Find latest completed attempt
        const completedAttempts = attempts.filter((a: QuizAttempt) => a.endTime);
        if (completedAttempts.length > 0) {
          const sortedAttempts = [...completedAttempts].sort((a: QuizAttempt, b: QuizAttempt) => 
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

  const getAvailabilityStatus = () => {
    if (!quiz) return { text: "", className: "" };
    
    const now = new Date();
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;
    
    if (!quiz.published) {
      return { text: "Not Published", className: "text-danger" };
    }
    
    if (availableUntil && now > availableUntil) {
      return { text: "Closed", className: "text-danger" };
    }
    
    if (availableFrom && now < availableFrom) {
      return { 
        text: `Not available until ${availableFrom.toLocaleDateString()} ${availableFrom.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 
        className: "text-warning" 
      };
    }
    
    return { text: "Available", className: "text-success" };
  };

  const canTakeQuiz = () => {
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
    const maxAttempts = quiz.attempts || 1;
    return completedAttempts.length < maxAttempts;
  };

  const getRemainingAttempts = () => {
    if (!quiz) return 0;
    const maxAttempts = quiz.attempts || 1;
    const completedAttempts = userAttempts.filter(a => a.endTime).length;
    return Math.max(0, maxAttempts - completedAttempts);
  };

  if (!quiz) {
    return <div className="text-center p-5">Loading...</div>;
  }

  const availabilityStatus = getAvailabilityStatus();
  const remainingAttempts = getRemainingAttempts();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title}</h2>
        <div>
          <Link to={`/Kambaz/Courses/${cid}/Quizs`}>
            <Button variant="secondary" className="me-2">Back to Quizzes</Button>
          </Link>
          {canEdit && (
            <>
              <Button 
                variant="warning" 
                className="me-2"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/edit`)}
              >
                <FaEdit className="me-1" /> Edit
              </Button>
              <Button 
                variant="primary" 
                className="me-2"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
              >
                Preview
              </Button>
              <Button 
                variant={quiz.published ? "outline-danger" : "success"}
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
            </>
          )}
          {isStudent && canTakeQuiz() && (
            <Button 
              variant="success"
              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
            >
              Take Quiz
            </Button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quiz Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg={availabilityStatus.className.includes('danger') 
                  ? 'danger' 
                  : availabilityStatus.className.includes('warning') 
                    ? 'warning' 
                    : 'success'} 
                  className="mb-2">
                  {availabilityStatus.text}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-2">{quiz.description || "No description provided"}</p>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-4">
                  <FaList className="me-2 text-primary" />
                  <strong>Questions:</strong> {questionCount}
                </div>
                <div className="col-md-4">
                  <FaClock className="me-2 text-primary" />
                  <strong>Time Limit:</strong> {quiz.timeLimit || 0} minutes
                </div>
                <div className="col-md-4">
                  <strong>Points:</strong> {totalPoints} points
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <FaCalendarAlt className="me-2 text-primary" />
                  <strong>Due Date:</strong> 
                  {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : "Not set"}
                </div>
                <div className="col-md-8">
                  <strong>Available:</strong> 
                  {quiz.availableFrom ? (
                    <>
                      From {new Date(quiz.availableFrom).toLocaleDateString()} 
                      {quiz.availableUntil ? ` until ${new Date(quiz.availableUntil).toLocaleDateString()}` : ""}
                    </>
                  ) : "Always"}
                </div>
              </div>

              <div className="mb-3">
                <strong>Attempts Allowed:</strong> {quiz.attempts || 1}
              </div>

              {isStudent && userAttempts.length > 0 && (
                <Alert variant="info">
                  <Alert.Heading>Your Attempts</Alert.Heading>
                  <p>
                    You have used {userAttempts.filter(a => a.endTime).length} of {quiz.attempts || 1} allowed attempts.
                    {remainingAttempts > 0 ? ` (${remainingAttempts} remaining)` : ""}
                  </p>
                  
                </Alert>
              )}
              
              {isStudent && !canTakeQuiz() && userAttempts.filter(a => a.endTime).length >= (quiz.attempts || 1) && (
                <Alert variant="warning">
                  <Alert.Heading>Maximum Attempts Reached</Alert.Heading>
                  <p>You have used all {quiz.attempts || 1} allowed attempts for this quiz.</p>
                </Alert>
              )}
              
              {isStudent && canTakeQuiz() && (
                <div className="text-center mt-4">
                  <Button 
                    variant="success"
                    size="lg"
                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
                  >
                    Start Quiz
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {isStudent && userAttempts.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Attempt History</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {userAttempts
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .map((attempt) => (
                    <ListGroup.Item key={attempt._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div><strong>Attempt {attempt.attemptNumber}</strong></div>
                        <div className="small text-muted">
                          Started: {new Date(attempt.startTime).toLocaleString()}
                        </div>
                        {attempt.endTime && (
                          <div className="small text-muted">
                            Completed: {new Date(attempt.endTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="d-flex align-items-center">
                        {attempt.endTime ? (
                          <>
                            <Badge bg="success" className="p-2 me-2">
                              Score: {attempt.score} / {attempt.totalPoints}
                            </Badge>
                  
                          </>
                        ) : (
                          <>
                            <Badge bg="warning" className="p-2 me-2">
                              In progress
                            </Badge>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview`)}
                            >
                              Continue
                            </Button>
                          </>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Card>
          )}
        </div>

        <div className="col-lg-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Quiz Information</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg={quiz.published ? "success" : "secondary"} className="mb-2">
                  {quiz.published ? "Published" : "Unpublished"}
                </Badge>
              </div>
              
              <div className="small text-muted">
                {canEdit && (
                  <div className="mb-2">
                    <strong>Permissions:</strong> 
                    <Badge bg="primary" className="ms-1">Faculty</Badge>
                  </div>
                )}
              </div>

              {isStudent && latestAttempt && (
                <div className="mt-4 pt-3 border-top">
                  <h6>Your Last Attempt</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div><strong>Score:</strong> {latestAttempt.score} / {latestAttempt.totalPoints}</div>
                      <div className="small text-muted">Completed: {new Date(latestAttempt.endTime || "").toLocaleDateString()}</div>
                    </div>
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/preview?viewAttempt=${latestAttempt._id}`)}
                    >
                      View Last Attempt
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}