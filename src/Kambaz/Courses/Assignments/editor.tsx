import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Assignment {
  _id: string;
  title: string;
  course: string;
  description?: string;
  points?: number;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  [key: string]: any;
}

export default function AssignmentEditor() {
  const { cid, aid } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { assignments } = useSelector((state: any) => state.assignmentsReducer);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  
  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  useEffect(() => {
    const foundAssignment = assignments.find((a: any) => a._id === aid);
    if (foundAssignment) {
      setAssignment(foundAssignment as Assignment);
    }
  }, [aid, assignments]);

  if (!assignment) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Assignment not found or does not exist.
        </div>
        <Link to={`/Kambaz/Courses/${cid}/Assignments`}>
          <Button variant="secondary">Back to Assignments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{assignment.title}</h2>
        <div>
          <Link to={`/Kambaz/Courses/${cid}/Assignments`}>
            <Button variant="secondary" className="me-2">Back</Button>
          </Link>
          {canEdit && (
            <Link to={`/Kambaz/Courses/${cid}/Assignments/${aid}/edit`}>
              <Button variant="primary">Edit Assignment</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Assignment Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-2">{assignment.description || "No description provided"}</p>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Points:</strong> {assignment.points || 100} points
                </div>
                <div className="col-md-6">
                  <strong>Due Date:</strong> 
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "Not set"}
                </div>
              </div>

              {assignment.availableFrom && (
                <div className="mb-2">
                  <strong>Available From:</strong> {new Date(assignment.availableFrom).toLocaleDateString()}
                </div>
              )}

              {assignment.availableUntil && (
                <div className="mb-2">
                  <strong>Available Until:</strong> {new Date(assignment.availableUntil).toLocaleDateString()}
                </div>
              )}
            </Card.Body>
          </Card>

          {!canEdit && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Submit Assignment</h5>
              </Card.Header>
              <Card.Body>
                <div className="alert alert-info">
                  <strong>Student Submission Area</strong><br/>
                  Please submit your assignment here. Various submission methods are supported including file upload and text entry.
                </div>
                <div className="mb-3">
                  <label htmlFor="submission-text" className="form-label">Text Submission</label>
                  <textarea 
                    className="form-control" 
                    id="submission-text" 
                    rows={6} 
                    placeholder="Enter your assignment content here..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="submission-file" className="form-label">File Upload</label>
                  <input className="form-control" type="file" id="submission-file" multiple />
                </div>
                <Button variant="success" size="lg">Submit Assignment</Button>
              </Card.Body>
            </Card>
          )}
        </div>

        <div className="col-lg-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Assignment Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg="success" className="mb-2">Published</Badge>
              </div>
              
              <div className="small text-muted">
                <div className="mb-2">
                  <strong>Course:</strong> {assignment.course}
                </div>
                <div className="mb-2">
                  <strong>Assignment ID:</strong> {assignment._id}
                </div>
                {canEdit && (
                  <div className="mb-2">
                    <strong>Permissions:</strong> 
                    <Badge bg="primary" className="ms-1">Faculty</Badge>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
  