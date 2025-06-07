import { useState, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Form, Button, Card, Badge, CloseButton, Alert } from "react-bootstrap";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addQuiz, updateQuiz } from "./reducer";

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
}

export default function EditQuiz() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { quizs } = useSelector((state: any) => state.quizsReducer);
  const [assignees, setAssignees] = useState<string[]>(["Everyone"]);
  const [input, setInput] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    dueDate: "",
    availableFrom: "",
    availableUntil: "",
    published: false,
    questions: 5,
    timeLimit: 60,
    attempts: 1
  });
  const [saveMessage, setSaveMessage] = useState("");

  // Check if this is a new quiz
  const foundQuiz = quizs.find((q: Quiz) => q._id === qid);
  const isNewQuiz = !foundQuiz;

  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!isNewQuiz && foundQuiz) {
      setQuiz(foundQuiz);
      setFormData({
        title: foundQuiz.title || "",
        description: foundQuiz.description || "",
        points: foundQuiz.points || 100,
        dueDate: foundQuiz.dueDate || "",
        availableFrom: foundQuiz.availableFrom || "",
        availableUntil: foundQuiz.availableUntil || "",
        published: foundQuiz.published || false,
        questions: foundQuiz.questions || 5,
        timeLimit: foundQuiz.timeLimit || 60,
        attempts: foundQuiz.attempts || 1
      });
    } else if (isNewQuiz) {

      setFormData({
        title: "New Quiz",
        description: "",
        points: 100,
        dueDate: "",
        availableFrom: "",
        availableUntil: "",
        published: false,
        questions: 5,
        timeLimit: 60,
        attempts: 1
      });
    }
  }, [qid, isNewQuiz, foundQuiz]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!assignees.includes(input.trim())) {
        setAssignees([...assignees, input.trim()]);
      }
      setInput("");
    }
  };

  const handleRemove = (name: string) => {
    setAssignees(assignees.filter((a) => a !== name));
  };

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      setSaveMessage("Please enter quiz title");
      return;
    }

    if (isNewQuiz) {
      // Create new quiz
      const newQuiz = {
        title: formData.title,
        course: cid!,
        description: formData.description,
        points: formData.points,
        dueDate: formData.dueDate,
        availableFrom: formData.availableFrom,
        availableUntil: formData.availableUntil,
        published: formData.published,
        questions: formData.questions,
        timeLimit: formData.timeLimit,
        attempts: formData.attempts
      };
      dispatch(addQuiz(newQuiz));
      setSaveMessage("Quiz created successfully!");
    } else {

      const updatedQuiz = {
        _id: qid!,
        title: formData.title,
        course: cid!,
        description: formData.description,
        points: formData.points,
        dueDate: formData.dueDate,
        availableFrom: formData.availableFrom,
        availableUntil: formData.availableUntil,
        published: formData.published,
        questions: formData.questions,
        timeLimit: formData.timeLimit,
        attempts: formData.attempts
      };
      dispatch(updateQuiz(updatedQuiz));
      setSaveMessage("Quiz updated successfully!");
    }

    setTimeout(() => {
      navigate(`/Kambaz/Courses/${cid}/Quizs`);
    }, 1500);
  };

  if (!canEdit) {
    return <Navigate to={`/Kambaz/Courses/${cid}/Quizs`} />;
  }

  if (!isNewQuiz && !quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>{isNewQuiz ? "Create New Quiz" : "Edit Quiz"}</h3>
        <div>
          <Link to={`/Kambaz/Courses/${cid}/Quizs`}>
            <Button variant="secondary" className="me-2">Cancel</Button>
          </Link>
          <Button variant="primary" onClick={handleSave}>Save</Button>
          <Button variant="success" className="ms-2" onClick={() => {
            handleSave();
            dispatch(updateQuiz({...quiz, published: true}));
          }}>Save & Publish</Button>
        </div>
      </div>

      {saveMessage && (
        <Alert variant="success" className="mb-3">
          {saveMessage}
        </Alert>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <Link 
            className="nav-link active" 
            to={`/Kambaz/Courses/${cid}/Quizs/${qid}/edit`}
          >
            Details
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className="nav-link" 
            to={`/Kambaz/Courses/${cid}/Quizs/${qid}/questions`}
          >
            Questions
          </Link>
        </li>
      </ul>

      <Form>
        <Form.Group className="mb-3" controlId="quizName">
          <Form.Label>Quiz Name *</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter quiz name" 
            value={formData.title}
            onChange={(e) => handleFormChange("title", e.target.value)}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="quizDescription">
          <Form.Label>Quiz Instructions</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Enter quiz instructions" 
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
        </Form.Group>

        <div className="row mb-3">
          <div className="col-md-4">
            <Form.Group controlId="quizPoints">
              <Form.Label>Points</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter points" 
                value={formData.points}
                onChange={(e) => handleFormChange("points", parseInt(e.target.value) || 0)}
              />
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group controlId="quizQuestions">
              <Form.Label>Number of Questions</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter number of questions" 
                value={formData.questions}
                onChange={(e) => handleFormChange("questions", parseInt(e.target.value) || 0)}
              />
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group controlId="quizTimeLimit">
              <Form.Label>Time Limit (minutes)</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter time limit" 
                value={formData.timeLimit}
                onChange={(e) => handleFormChange("timeLimit", parseInt(e.target.value) || 0)}
              />
            </Form.Group>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group controlId="quizAttempts">
              <Form.Label>Allowed Attempts</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter allowed attempts" 
                value={formData.attempts}
                onChange={(e) => handleFormChange("attempts", parseInt(e.target.value) || 1)}
                min="1"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group controlId="quizDueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={formData.dueDate}
                onChange={(e) => handleFormChange("dueDate", e.target.value)}
              />
            </Form.Group>
          </div>
        </div>

        <Card className="mb-3">
          <Card.Header>Availability</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3" controlId="quizPublished">
              <Form.Check 
                type="checkbox" 
                label="Published (visible to students)"
                checked={formData.published}
                onChange={(e) => handleFormChange("published", e.target.checked)}
              />
            </Form.Group>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="quizAvailableFrom">
                  <Form.Label>Available from</Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    value={formData.availableFrom}
                    onChange={(e) => handleFormChange("availableFrom", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="quizUntil">
                  <Form.Label>Available until</Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    value={formData.availableUntil}
                    onChange={(e) => handleFormChange("availableUntil", e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header>Assign</Card.Header>
          <Card.Body>
            <Form.Label className="mb-2">Assign to</Form.Label>
            <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
              {assignees.map((name) => (
                <Badge bg="secondary" key={name} className="d-flex align-items-center">
                  {name}
                  <CloseButton onClick={() => handleRemove(name)} className="ms-1" />
                </Badge>
              ))}
              <Form.Control
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Add assignee and press Enter or ,"
                className="border-0 shadow-none flex-grow-1"
                style={{ minWidth: 120, maxWidth: 200 }}
              />
            </div>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
}