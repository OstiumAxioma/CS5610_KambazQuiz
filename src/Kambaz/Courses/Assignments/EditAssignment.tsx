import { useState, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Form, Button, Card, Badge, CloseButton, Alert } from "react-bootstrap";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addAssignment, updateAssignment } from "./reducer";

interface Assignment {
  _id: string;
  title: string;
  course: string;
  description?: string;
  points?: number;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
}

export default function EditAssignment() {
  const { cid, aid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { assignments } = useSelector((state: any) => state.assignmentsReducer);
  const [assignees, setAssignees] = useState<string[]>(["Everyone"]);
  const [input, setInput] = useState("");
  const [submissionType, setSubmissionType] = useState("Online");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    dueDate: "",
    availableFrom: "",
    availableUntil: ""
  });
  const [saveMessage, setSaveMessage] = useState("");

  // Check if this is a new assignment
  const isNewAssignment = aid === "new";

  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!isNewAssignment) {
      const foundAssignment = assignments.find((a: Assignment) => a._id === aid);
      if (foundAssignment) {
        setAssignment(foundAssignment);
        setFormData({
          title: foundAssignment.title || "",
          description: foundAssignment.description || "",
          points: foundAssignment.points || 100,
          dueDate: foundAssignment.dueDate || "",
          availableFrom: foundAssignment.availableFrom || "",
          availableUntil: foundAssignment.availableUntil || ""
        });
      }
    } else {
      // Initialize new assignment
      setFormData({
        title: "",
        description: "",
        points: 100,
        dueDate: "",
        availableFrom: "",
        availableUntil: ""
      });
    }
  }, [aid, isNewAssignment, assignments]);

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

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      setSaveMessage("Please enter assignment title");
      return;
    }

    if (isNewAssignment) {
      // Create new assignment
      const newAssignment = {
        title: formData.title,
        course: cid!,
        description: formData.description,
        points: formData.points,
        dueDate: formData.dueDate,
        availableFrom: formData.availableFrom,
        availableUntil: formData.availableUntil
      };
      dispatch(addAssignment(newAssignment));
      setSaveMessage("Assignment created successfully!");
    } else {
      // Update existing assignment
      const updatedAssignment = {
        _id: aid!,
        title: formData.title,
        course: cid!,
        description: formData.description,
        points: formData.points,
        dueDate: formData.dueDate,
        availableFrom: formData.availableFrom,
        availableUntil: formData.availableUntil
      };
      dispatch(updateAssignment(updatedAssignment));
      setSaveMessage("Assignment updated successfully!");
    }

    setTimeout(() => {
      navigate(`/Kambaz/Courses/${cid}/Assignments`);
    }, 1500);
  };

  // Redirect if no edit permissions
  if (!canEdit) {
    return <Navigate to={`/Kambaz/Courses/${cid}/Assignments`} />;
  }

  if (!isNewAssignment && !assignment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>{isNewAssignment ? "Create New Assignment" : "Edit Assignment"}</h3>
        <div>
          <Link to={`/Kambaz/Courses/${cid}/Assignments`}>
            <Button variant="secondary" className="me-2">Cancel</Button>
          </Link>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </div>
      </div>

      {saveMessage && (
        <Alert variant="success" className="mb-3">
          {saveMessage}
        </Alert>
      )}

      <Form>
        <Form.Group className="mb-3" controlId="assignmentName">
          <Form.Label>Assignment Name *</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter assignment name" 
            value={formData.title}
            onChange={(e) => handleFormChange("title", e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="assignmentDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Enter assignment description" 
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="assignmentPoints">
          <Form.Label>Points</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="Enter points" 
            value={formData.points}
            onChange={(e) => handleFormChange("points", parseInt(e.target.value) || 0)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="assignmentDueDate">
          <Form.Label>Due Date</Form.Label>
          <Form.Control 
            type="date" 
            value={formData.dueDate}
            onChange={(e) => handleFormChange("dueDate", e.target.value)}
          />
        </Form.Group>
        <Card className="mb-3">
          <Card.Header>Submission Type</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3" controlId="submissionTypeSelect">
              <Form.Label>Select Submission Type</Form.Label>
              <Form.Select value={submissionType} onChange={e => setSubmissionType(e.target.value)}>
                <option value="Online">Online</option>
                <option value="On Paper">On Paper</option>
                <option value="Optional">Optional</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="assignmentSubmissionType">
              <Form.Label>Submission Options</Form.Label>
              <div>
                <Form.Check type="checkbox" id="submission-textentry" label="Text Entry" className="mb-1" />
                <Form.Check type="checkbox" id="submission-websiteurl" label="Website URL" className="mb-1" />
                <Form.Check type="checkbox" id="submission-media" label="Media Recordings" className="mb-1" />
                <Form.Check type="checkbox" id="submission-annotation" label="Student Annotation" className="mb-1" />
                <Form.Check type="checkbox" id="submission-fileupload" label="File Upload" className="mb-1" />
              </div>
            </Form.Group>
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
            <Form.Group className="mb-3" controlId="assignDue">
              <Form.Label>Due</Form.Label>
              <Form.Control 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => handleFormChange("dueDate", e.target.value)}
              />
            </Form.Group>
            <div className="row mb-3">
              <div className="col">
                <Form.Group controlId="assignAvailableFrom">
                  <Form.Label>Available from</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={formData.availableFrom}
                    onChange={(e) => handleFormChange("availableFrom", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col">
                <Form.Group controlId="assignUntil">
                  <Form.Label>Until</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={formData.availableUntil}
                    onChange={(e) => handleFormChange("availableUntil", e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
} 