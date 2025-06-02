import { useState } from "react";
import { FaSearch, FaPlus, FaCheckCircle, FaTrash, FaEdit } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { ListGroup, Button, Modal } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteAssignment } from "./reducer";

interface Assignment {
  _id: string;
  title: string;
  course: string;
  description?: string;
  points?: number;
  dueDate?: string;
}

export default function Assignments() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { assignments } = useSelector((state: any) => state.assignmentsReducer);
  const courseAssignments = assignments.filter((assignment: Assignment) => assignment.course === cid);
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  const handleAddAssignment = () => {
    navigate(`/Kambaz/Courses/${cid}/Assignments/new/edit`);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (assignmentToDelete) {
      dispatch(deleteAssignment(assignmentToDelete._id));
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row align-items-center mb-3">
        <div className="col-6">
          <div className="input-group w-100">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search for Assignments"
              id="wd-search-assignment"
            />
          </div>
        </div>
        {canEdit && (
          <div className="col d-flex justify-content-end">
            <button className="btn btn-secondary me-2" id="wd-add-assignment-group">
              <FaPlus className="me-1" /> Group
            </button>
            <button 
              className="btn btn-danger" 
              id="wd-add-assignment"
              onClick={handleAddAssignment}
            >
              <FaPlus className="me-1" /> Assignment
            </button>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <h3 className="mb-0 me-3" id="wd-assignments-title">
              ASSIGNMENTS <span className="fw-normal ms-2">40% of Total</span>
            </h3>
            {canEdit && (
              <button 
                className="btn btn-light ms-auto p-2"
                onClick={handleAddAssignment}
              >
                <FaPlus />
              </button>
            )}
          </div>
          <ListGroup id="wd-assignment-list">
            {courseAssignments.map((assignment: Assignment) => (
              <ListGroup.Item key={assignment._id} className="d-flex align-items-start border-start border-4 border-success mb-3 p-3 wd-assignment-list-item">
                <MdMenuBook className="text-success fs-4 me-3 mt-1" />
                <div className="flex-grow-1">
                  <div className="fw-bold fs-5">
                    {canEdit ? (
                      <Link to={`/Kambaz/Courses/${cid}/Assignments/${assignment._id}/edit`} className="text-decoration-none text-dark">
                        {assignment.title}
                      </Link>
                    ) : (
                      <Link to={`/Kambaz/Courses/${cid}/Assignments/${assignment._id}`} className="text-decoration-none text-dark">
                        {assignment.title}
                      </Link>
                    )}
                  </div>
                  <div className="small">
                    <span className="text-danger">Multiple Modules</span>
                    <span className="text-muted"> | Not available until May 6 at 12:00am</span>
                  </div>
                  <div className="text-muted small">
                    Due May 13 at 11:59pm | {assignment.points || 100} pts
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {canEdit && (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/Kambaz/Courses/${cid}/Assignments/${assignment._id}/edit`)}
                        title="Edit Assignment"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment)}
                        title="Delete Assignment"
                      >
                        <FaTrash />
                      </Button>
                    </>
                  )}
                  <FaCheckCircle className="text-success fs-4 ms-2" />
                </div>
              </ListGroup.Item>
            ))}
            {courseAssignments.length === 0 && (
              <ListGroup.Item className="text-center text-muted py-4">
                {canEdit ? "No assignments yet. Click + to create your first assignment." : "No assignments available."}
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete assignment "{assignmentToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
  