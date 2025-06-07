import React, { useState, useEffect } from "react";
import { Button, Card, Form, Alert, Badge, ListGroup } from "react-bootstrap";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateQuiz } from "./reducer";

interface Option {
  id: string;
  text: string;
}

interface Question {
  _id: string;
  type: string;
  title: string;
  questionText: string;
  points: number;
  options?: Option[];
  correctOption?: string;
  correctAnswer?: boolean;
  possibleAnswers?: string[];
}

interface Quiz {
  _id: string;
  title: string;
  course: string;
  questionList?: Question[];
  [key: string]: any;
}

export default function QuestionsEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizs } = useSelector((state: any) => state.quizsReducer);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Question>({
    _id: "",
    type: "multiple_choice",
    title: "",
    questionText: "",
    points: 10,
    options: [
      { id: "option1", text: "" },
      { id: "option2", text: "" }
    ],
    correctOption: "option1"
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const foundQuiz = quizs.find((q: Quiz) => q._id === qid);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      setQuestions(foundQuiz.questionList || []);
    }
  }, [qid, quizs]);

  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    
    let updatedQuestion: Question = {
      ...newQuestion,
      type
    };
    
    if (type === "multiple_choice") {
      updatedQuestion = {
        ...updatedQuestion,
        options: [
          { id: "option1", text: "" },
          { id: "option2", text: "" }
        ],
        correctOption: "option1"
      };
    } else if (type === "true_false") {
      updatedQuestion = {
        ...updatedQuestion,
        correctAnswer: true
      };
    } else if (type === "fill_in_blank") {
      updatedQuestion = {
        ...updatedQuestion,
        possibleAnswers: [""]
      };
    }
    
    setNewQuestion(updatedQuestion);
  };

  const handleAddQuestion = () => {
    setEditingQuestionId(null);
    setNewQuestion({
      _id: new Date().getTime().toString(),
      type: "multiple_choice",
      title: "New Question",
      questionText: "",
      points: 10,
      options: [
        { id: "option1", text: "" },
        { id: "option2", text: "" }
      ],
      correctOption: "option1"
    });
    setEditingQuestionId("new");
  };

  const handleEditQuestion = (questionId: string) => {
    const question = questions.find(q => q._id === questionId);
    if (question) {
      setNewQuestion({ ...question });
      setEditingQuestionId(questionId);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q._id !== questionId));
    setEditingQuestionId(null);
  };

  const handleSaveQuestion = () => {
    if (!newQuestion.title.trim()) {
      setErrorMessage("Please enter a question title");
      return;
    }
    
    if (!newQuestion.questionText.trim()) {
      setErrorMessage("Please enter question text");
      return;
    }
    
    if (newQuestion.type === "multiple_choice") {
      if (!newQuestion.options || newQuestion.options.length < 2) {
        setErrorMessage("Please add at least two options");
        return;
      }
      
      if (newQuestion.options.some(opt => !opt.text.trim())) {
        setErrorMessage("Please fill in all option texts");
        return;
      }
      
      if (!newQuestion.correctOption) {
        setErrorMessage("Please select a correct option");
        return;
      }
    }
    
    if (newQuestion.type === "fill_in_blank") {
      if (!newQuestion.possibleAnswers || newQuestion.possibleAnswers.length === 0) {
        setErrorMessage("Please add at least one possible answer");
        return;
      }
      
      if (newQuestion.possibleAnswers.some(ans => !ans.trim())) {
        setErrorMessage("Please fill in all possible answers");
        return;
      }
    }
    
    setErrorMessage("");
    
    if (editingQuestionId === "new") {
      setQuestions([...questions, newQuestion]);
    } else {
      setQuestions(questions.map(q => 
        q._id === editingQuestionId ? newQuestion : q
      ));
    }
    
    setEditingQuestionId(null);
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setErrorMessage("");
  };

  const handleAddOption = () => {
    if (!newQuestion.options) return;
    
    const newOptionId = `option${newQuestion.options.length + 1}`;
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { id: newOptionId, text: "" }]
    });
  };

  const handleRemoveOption = (optionId: string) => {
    if (!newQuestion.options) return;
    
    // Don't allow removing if there are only 2 options
    if (newQuestion.options.length <= 2) {
      setErrorMessage("Multiple choice questions must have at least 2 options");
      return;
    }
    
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter(opt => opt.id !== optionId),
      correctOption: newQuestion.correctOption === optionId ? newQuestion.options[0].id : newQuestion.correctOption
    });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    if (!newQuestion.options) return;
    
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.map(opt =>
        opt.id === optionId ? { ...opt, text } : opt
      )
    });
  };

  const handleAddPossibleAnswer = () => {
    if (!newQuestion.possibleAnswers) return;
    
    setNewQuestion({
      ...newQuestion,
      possibleAnswers: [...newQuestion.possibleAnswers, ""]
    });
  };

  const handleRemovePossibleAnswer = (index: number) => {
    if (!newQuestion.possibleAnswers) return;
    
    if (newQuestion.possibleAnswers.length <= 1) {
      setErrorMessage("Fill in the blank questions must have at least one possible answer");
      return;
    }
    
    setNewQuestion({
      ...newQuestion,
      possibleAnswers: newQuestion.possibleAnswers.filter((_, i) => i !== index)
    });
  };

  const handlePossibleAnswerChange = (index: number, text: string) => {
    if (!newQuestion.possibleAnswers) return;
    
    setNewQuestion({
      ...newQuestion,
      possibleAnswers: newQuestion.possibleAnswers.map((ans, i) =>
        i === index ? text : ans
      )
    });
  };

  const handleSaveQuiz = () => {
    if (!quiz) return;
    
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    const updatedQuiz = {
      ...quiz,
      questionList: questions,
      questions: questions.length,
      points: totalPoints
    };
    
    dispatch(updateQuiz(updatedQuiz));
    setSaveMessage("Questions saved successfully!");
    
    setTimeout(() => {
      navigate(`/Kambaz/Courses/${cid}/Quizs/${qid}/edit`);
    }, 1500);
  };

  const handleCancelQuiz = () => {
    navigate(`/Kambaz/Courses/${cid}/Quizs`);
  };

  const renderQuestionEditor = () => {
    if (!editingQuestionId) return null;
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5>{editingQuestionId === "new" ? "Add New Question" : "Edit Question"}</h5>
        </Card.Header>
        <Card.Body>
          {errorMessage && (
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Question Type</Form.Label>
            <Form.Select 
              value={newQuestion.type} 
              onChange={handleQuestionTypeChange}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="fill_in_blank">Fill in the Blank</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Question Title</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter title"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Points</Form.Label>
            <Form.Control 
              type="number"
              min="1"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value) || 0})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Question Text</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              placeholder="Enter the question"
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
            />
          </Form.Group>
          
          {/* Multiple Choice Options */}
          {newQuestion.type === "multiple_choice" && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Options</Form.Label>
                <Button variant="primary" size="sm" onClick={handleAddOption}>
                  <FaPlus className="me-1" /> Add Option
                </Button>
              </div>
              
              {newQuestion.options?.map((option) => (
                <div key={option.id} className="d-flex align-items-center mb-2">
                  <Form.Check
                    type="radio"
                    id={`correct-${option.id}`}
                    name="correctOption"
                    checked={newQuestion.correctOption === option.id}
                    onChange={() => setNewQuestion({...newQuestion, correctOption: option.id})}
                    label="Correct"
                    className="me-2 w-25"
                  />
                  <Form.Control 
                    type="text"
                    placeholder={`Option ${option.id.replace('option', '')}`}
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    className="me-2"
                  />
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* True/False */}
          {newQuestion.type === "true_false" && (
            <div className="mb-3">
              <Form.Label>Correct Answer</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="true-answer"
                  name="correctTrueFalse"
                  label="True"
                  checked={newQuestion.correctAnswer === true}
                  onChange={() => setNewQuestion({...newQuestion, correctAnswer: true})}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="false-answer"
                  name="correctTrueFalse"
                  label="False"
                  checked={newQuestion.correctAnswer === false}
                  onChange={() => setNewQuestion({...newQuestion, correctAnswer: false})}
                />
              </div>
            </div>
          )}
          
          {/* Fill in the Blank */}
          {newQuestion.type === "fill_in_blank" && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Possible Answers (case insensitive)</Form.Label>
                <Button variant="primary" size="sm" onClick={handleAddPossibleAnswer}>
                  <FaPlus className="me-1" /> Add Answer
                </Button>
              </div>
              
              {newQuestion.possibleAnswers?.map((answer, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <Form.Control 
                    type="text"
                    placeholder={`Possible answer ${index + 1}`}
                    value={answer}
                    onChange={(e) => handlePossibleAnswerChange(index, e.target.value)}
                    className="me-2"
                  />
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleRemovePossibleAnswer(index)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="d-flex justify-content-end mt-4">
            <Button 
              variant="secondary" 
              className="me-2"
              onClick={handleCancelEditQuestion}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSaveQuestion}
            >
              {editingQuestionId === "new" ? "Add Question" : "Update Question"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderQuestionList = () => {
    if (questions.length === 0) {
      return (
        <Alert variant="info">
          This quiz has no questions yet. Click the "Add Question" button to create your first question.
        </Alert>
      );
    }
    
    return (
      <ListGroup className="mb-4">
        {questions.map((question, index) => (
          <ListGroup.Item 
            key={question._id}
            className="d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <Badge bg="secondary" className="me-3">{index + 1}</Badge>
              <div>
                <div className="fw-bold">{question.title}</div>
                <div className="small text-muted">
                  {question.type === "multiple_choice" 
                    ? "Multiple Choice" 
                    : question.type === "true_false"
                      ? "True/False"
                      : "Fill in the Blank"} | {question.points} points
                </div>
              </div>
            </div>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => handleEditQuestion(question._id)}
              >
                <FaPencilAlt />
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDeleteQuestion(question._id)}
              >
                <FaTrash />
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Edit Questions: {quiz?.title}</h3>
        <div>
          <Button 
            variant="secondary" 
            className="me-2"
            onClick={handleCancelQuiz}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSaveQuiz}
          >
            Save
          </Button>
          <Button 
            variant="success" 
            className="ms-2"
            onClick={() => {
              handleSaveQuiz();
              if (quiz) {
                dispatch(updateQuiz({...quiz, published: true, questionList: questions}));
                setTimeout(() => {
                  navigate(`/Kambaz/Courses/${cid}/Quizs`);
                }, 1500);
              }
            }}
          >
            Save & Publish
          </Button>
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
            className="nav-link" 
            to={`/Kambaz/Courses/${cid}/Quizs/${qid}/edit`}
          >
            Details
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            className="nav-link active" 
            to={`/Kambaz/Courses/${cid}/Quizs/${qid}/questions`}
          >
            Questions
          </Link>
        </li>
      </ul>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>Questions <Badge bg="secondary">{questions.length}</Badge></h5>
          <div className="text-muted">
            Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
          </div>
        </div>
        <Button 
          variant="success"
          onClick={handleAddQuestion}
          disabled={!!editingQuestionId}
        >
          <FaPlus className="me-1" /> Add Question
        </Button>
      </div>
      
      {renderQuestionEditor()}
      {!editingQuestionId && renderQuestionList()}
    </div>
  );
}