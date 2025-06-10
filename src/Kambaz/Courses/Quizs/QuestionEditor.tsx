import { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Question {
  _id?: string;
  quizId: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  title: string;
  points: number;
  question: string;
  choices?: { text: string; correct: boolean }[];
  correctAnswer?: boolean;
  possibleAnswers?: string[];
}

interface QuestionEditorProps {
  question?: Question;
  quizId: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export default function QuestionEditor({ question, quizId, type, onSave, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState<Question>({
    quizId,
    type,
    title: "",
    points: 1,
    question: "",
    choices: [
      { text: "", correct: true },
      { text: "", correct: false }
    ],
    correctAnswer: true,
    possibleAnswers: [""]
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        choices: question.choices || [
          { text: "", correct: true },
          { text: "", correct: false }
        ],
        possibleAnswers: question.possibleAnswers || [""]
      });
    } else {
      setFormData(prev => ({
        ...prev,
        type
      }));
    }
  }, [question, type]);

  const handleFieldChange = (field: keyof Question, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChoiceChange = (index: number, field: 'text' | 'correct', value: string | boolean) => {
    const newChoices = [...(formData.choices || [])];
    if (field === 'correct' && value === true) {
      // Only one choice can be correct for multiple choice
      newChoices.forEach((choice, i) => {
        choice.correct = i === index;
      });
    } else {
      newChoices[index] = { ...newChoices[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const addChoice = () => {
    const newChoices = [...(formData.choices || [])];
    newChoices.push({ text: "", correct: false });
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const removeChoice = (index: number) => {
    const newChoices = formData.choices?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const handlePossibleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.possibleAnswers || [])];
    newAnswers[index] = value;
    setFormData(prev => ({ ...prev, possibleAnswers: newAnswers }));
  };

  const addPossibleAnswer = () => {
    const newAnswers = [...(formData.possibleAnswers || [])];
    newAnswers.push("");
    setFormData(prev => ({ ...prev, possibleAnswers: newAnswers }));
  };

  const removePossibleAnswer = (index: number) => {
    const newAnswers = formData.possibleAnswers?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, possibleAnswers: newAnswers }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push("Question title is required");
    }

    if (!formData.question.trim()) {
      newErrors.push("Question text is required");
    }

    if (formData.points <= 0) {
      newErrors.push("Points must be greater than 0");
    }

    if (formData.type === "multiple-choice") {
      if (!formData.choices || formData.choices.length < 2) {
        newErrors.push("At least 2 choices are required for multiple choice questions");
      }
      if (!formData.choices?.some(choice => choice.correct)) {
        newErrors.push("At least one choice must be marked as correct");
      }
      if (formData.choices?.some(choice => !choice.text.trim())) {
        newErrors.push("All choices must have text");
      }
    }

    if (formData.type === "fill-blank") {
      if (!formData.possibleAnswers || formData.possibleAnswers.length === 0) {
        newErrors.push("At least one possible answer is required for fill in the blank questions");
      }
      if (formData.possibleAnswers?.some(answer => !answer.trim())) {
        newErrors.push("All possible answers must have text");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const questionToSave: Question = {
      ...formData,
      _id: question?._id || new Date().getTime().toString(),
      quizId: quizId
    };

    onSave(questionToSave);
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "multiple-choice":
        return (
          <Card className="mb-3">
            <Card.Header>Choices</Card.Header>
            <Card.Body>
              {formData.choices?.map((choice, index) => (
                <Row key={index} className="mb-2 align-items-center">
                  <Col xs={1}>
                    <Form.Check
                      type="radio"
                      name="correctChoice"
                      checked={choice.correct}
                      onChange={() => handleChoiceChange(index, 'correct', true)}
                    />
                  </Col>
                  <Col xs={10}>
                    <Form.Control
                      type="text"
                      placeholder={`Choice ${index + 1}`}
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                    />
                  </Col>
                  <Col xs={1}>
                    {formData.choices && formData.choices.length > 2 && (
                      <Button variant="outline-danger" size="sm" onClick={() => removeChoice(index)}>
                        <FaTrash />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button variant="outline-primary" size="sm" onClick={addChoice}>
                <FaPlus className="me-1" /> Add Choice
              </Button>
            </Card.Body>
          </Card>
        );

      case "true-false":
        return (
          <Card className="mb-3">
            <Card.Header>Correct Answer</Card.Header>
            <Card.Body>
              <Form.Check
                type="radio"
                label="True"
                name="correctAnswer"
                checked={formData.correctAnswer === true}
                onChange={() => handleFieldChange('correctAnswer', true)}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                label="False"
                name="correctAnswer"
                checked={formData.correctAnswer === false}
                onChange={() => handleFieldChange('correctAnswer', false)}
              />
            </Card.Body>
          </Card>
        );

      case "fill-blank":
        return (
          <Card className="mb-3">
            <Card.Header>Possible Correct Answers</Card.Header>
            <Card.Body>
              {formData.possibleAnswers?.map((answer, index) => (
                <Row key={index} className="mb-2 align-items-center">
                  <Col xs={11}>
                    <Form.Control
                      type="text"
                      placeholder={`Possible answer ${index + 1}`}
                      value={answer}
                      onChange={(e) => handlePossibleAnswerChange(index, e.target.value)}
                    />
                  </Col>
                  <Col xs={1}>
                    {formData.possibleAnswers && formData.possibleAnswers.length > 1 && (
                      <Button variant="outline-danger" size="sm" onClick={() => removePossibleAnswer(index)}>
                        <FaTrash />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button variant="outline-primary" size="sm" onClick={addPossibleAnswer}>
                <FaPlus className="me-1" /> Add Answer
              </Button>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Form onSubmit={handleSave}>
      {errors.length > 0 && (
        <Alert variant="danger" className="mb-3">
          <ul className="mb-0">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Question Title</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter question title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.question}
              onChange={(e) => handleFieldChange('question', e.target.value)}
              placeholder="Enter your question"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Points</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => handleFieldChange('points', parseInt(e.target.value) || 1)}
              required
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {renderTypeSpecificFields()}

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {question ? "Update Question" : "Save Question"}
        </Button>
      </div>
    </Form>
  );
} 