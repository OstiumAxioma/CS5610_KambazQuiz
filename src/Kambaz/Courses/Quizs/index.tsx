import { useState } from "react";
import { FaSearch, FaPlus, FaCheckCircle, FaTrash, FaEdit, FaBan, FaEllipsisV } from "react-icons/fa";
import { BsQuestionCircle } from "react-icons/bs";
import { ListGroup, Button, Modal, Dropdown } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteQuiz, addQuiz, toggleQuizPublish } from "./reducer";

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

export default function Quizs() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { quizs } = useSelector((state: any) => state.quizsReducer);
  const { quizAttempts } = useSelector((state: any) => state.quizAttemptsReducer);
  
  const courseQuizs = quizs.filter((quiz: Quiz) => {
    if (currentUser?.role === "STUDENT") {
      return quiz.course === cid && quiz.published === true;
    }
    return quiz.course === cid;
  });
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  const handleAddQuiz = () => {
    const newQuizId = new Date().getTime().toString();
    const newQuiz = {
      _id: newQuizId,
      title: "New Quiz",
      course: cid,
    };
    dispatch(addQuiz(newQuiz));
    // Navigate to edit page for the new quiz
    navigate(`/Kambaz/Courses/${cid}/Quizs/${newQuizId}/edit`);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      dispatch(deleteQuiz(quizToDelete._id));
      setShowDeleteModal(false);
      setQuizToDelete(null);
    }
  };

  const handleTogglePublish = (quizId: string) => {
    dispatch(toggleQuizPublish(quizId));
  };

  const getAvailabilityStatus = (quiz: Quiz) => {
    const now = new Date();
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

    if (!quiz.published) {
      return { text: "Not Published", className: "text-muted" };
    }

    if (availableUntil && now > availableUntil) {
      return { text: "Closed", className: "text-danger" };
    }

    if (availableFrom && now < availableFrom) {
      const dateStr = availableFrom.toLocaleDateString();
      return { text: `Not available until ${dateStr}`, className: "text-warning" };
    }

    if (availableFrom && availableUntil && now >= availableFrom && now <= availableUntil) {
      return { text: "Available", className: "text-success" };
    }

    return { text: "Available", className: "text-success" };
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    return `Due ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
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
              placeholder="Search for Quizs"
              id="wd-search-quiz"
            />
          </div>
        </div>
        {canEdit && (
          <div className="col d-flex justify-content-end">
            <button 
              className="btn btn-danger" 
              id="wd-add-quiz"
              onClick={handleAddQuiz}
            >
              <FaPlus className="me-1" /> Quiz
            </button>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <h3 className="mb-0 me-3" id="wd-quizs-title">
              QUIZS
            </h3>
            {canEdit && (
              <button 
                className="btn btn-light ms-auto p-2"
                onClick={handleAddQuiz}
              >
                <FaPlus />
              </button>
            )}
          </div>
          <ListGroup id="wd-quiz-list">
            {courseQuizs.map((quiz: Quiz) => {
              const availabilityStatus = getAvailabilityStatus(quiz);
              return (
                <ListGroup.Item key={quiz._id} className="d-flex align-items-start border-start border-4 border-success mb-3 p-3 wd-quiz-list-item">
                  <BsQuestionCircle className="text-success fs-4 me-3 mt-1" />
                  <div className="flex-grow-1">
                    <div className="fw-bold fs-5">
                      {canEdit ? (
                        <Link to={`/Kambaz/Courses/${cid}/Quizs/${quiz._id}`} className="text-decoration-none text-dark">
                          {quiz.title}
                        </Link>
                      ) : (
                        <Link to={`/Kambaz/Courses/${cid}/Quizs/${quiz._id}`} className="text-decoration-none text-dark">
                          {quiz.title}
                        </Link>
                      )}
                    </div>
                    <div className="small">
                      <span className={availabilityStatus.className}>
                        {availabilityStatus.text}
                      </span>
                    </div>
                    <div className="text-muted small">
                      {formatDueDate(quiz.dueDate)} | {quiz.points || 100} pts | {quiz.questions || 0} Questions
                    </div>
                    {currentUser?.role === "STUDENT" && quiz.published && (
                      <div className="text-muted small">
                        Last attempt score: {
                          quizAttempts.filter((a: any) => a.quiz === quiz._id && a.user === currentUser._id && a.endTime).length > 0 
                            ? `${quizAttempts.filter((a: any) => a.quiz === quiz._id && a.user === currentUser._id)
                                .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0].score} / ${quiz.points || 100}`
                            : `-- / ${quiz.points || 100}`
                        }
                      </div>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {canEdit ? (
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${quiz._id}`}>
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${quiz._id}/edit`)}>
                            <FaEdit className="me-2" /> Edit
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${quiz._id}/preview`)}>
                            <FaCheckCircle className="me-2" /> Preview
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDeleteQuiz(quiz)}>
                            <FaTrash className="me-2" /> Delete
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleTogglePublish(quiz._id)}>
                            {quiz.published ? (
                              <>
                                <FaBan className="me-2" /> Unpublish
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="me-2" /> Publish
                              </>
                            )}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : (
                      quiz.published && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizs/${quiz._id}/preview`)}
                        >
                          Take Quiz
                        </Button>
                      )
                    )}
                    <div className="ms-2">
                      {quiz.published ? (
                        <FaCheckCircle 
                          className="text-success fs-4 cursor-pointer" 
                          onClick={canEdit ? () => handleTogglePublish(quiz._id) : undefined}
                          title="Published - Click to unpublish"
                        />
                      ) : (
                        <FaBan 
                          className="text-muted fs-4 cursor-pointer" 
                          onClick={canEdit ? () => handleTogglePublish(quiz._id) : undefined}
                          title="Unpublished - Click to publish"
                        />
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
            {courseQuizs.length === 0 && (
              <ListGroup.Item className="text-center text-muted py-4">
                {canEdit ? "No quizs yet. Click + Quiz to create your first quiz." : "No quizs available."}
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
          Are you sure you want to delete quiz "{quizToDelete?.title}"? This action cannot be undone.
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