import { useState } from "react";
import { Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "./Account/reducer";
import { addCourse, deleteCourse, updateCourse } from "./Courses/reducer";
import { addEnrollment, enrollUserInCourse, unenrollUserFromCourse } from "./Account/enrollmentsReducer";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { courses } = useSelector((state: any) => state.coursesReducer);
  const { enrollments } = useSelector((state: any) => state.enrollmentsReducer);
  
  // Local state for the course form
  const [course, setCourse] = useState({
    _id: "1234",
    name: "New Course",
    number: "New Number",
    startDate: "2023-09-10",
    endDate: "2023-12-15",
    description: "New Description",
    department: "",
    credits: 3,
    image: ""
  });
  
  // State to toggle between enrolled courses and all courses
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  const signout = () => {
    dispatch(setCurrentUser(null));
    navigate("/Kambaz/Account/Signin");
  };

  // Enhanced add new course function that also creates enrollment
  const handleAddNewCourse = () => {
    // Validate required fields
    if (!course.name || !course.number) {
      alert("Please fill in at least Course Name and Course Number");
      return;
    }
    
    console.log("Adding course:", course);
    
    // Store the current course data
    const courseData = { ...course };
    
    // Dispatch add course action
    dispatch(addCourse(courseData));
    
    // Wait a moment for the state to update, then create enrollment
    setTimeout(() => {
      // The course should now be in the Redux state
      // We need to find it by the most recent timestamp since we're using Date.now()
      const sortedCourses = [...courses].sort((a, b) => parseInt(b._id) - parseInt(a._id));
      const newCourse = sortedCourses.find(c => 
        c.name === courseData.name && 
        c.number === courseData.number &&
        c.description === courseData.description
      );
      
      if (newCourse) {
        console.log("Found new course in Redux state:", newCourse);
        
        // Create enrollment record for current user
        const newEnrollment = {
          _id: `enrollment_${Date.now()}`,
          user: currentUser._id,
          course: newCourse._id
        };
        
        dispatch(addEnrollment(newEnrollment));
        console.log("Created enrollment:", newEnrollment);
        
        // // Trigger re-render by updating the enrollment trigger
        // setEnrollmentTrigger(prev => prev + 1);
        
        alert("Course added and enrolled successfully!");
        
        // Reset the course form
        setCourse({
          _id: "1234",
          name: "New Course",
          number: "New Number",
          startDate: "2023-09-10",
          endDate: "2023-12-15",
          description: "New Description",
          department: "",
          credits: 3,
          image: ""
        });
      } else {
        console.error("Could not find the newly added course");
        alert("Course was added but enrollment failed. Please try again.");
      }
    }, 200);
  };

  const handleUpdateCourse = () => {
    dispatch(updateCourse(course));
  };

  const handleDeleteCourse = (courseId: any) => {
    dispatch(deleteCourse(courseId));
  };

  const handleEnroll = (courseId: string) => {
    dispatch(enrollUserInCourse({ userId: currentUser._id, courseId }));
  };

  const handleUnenroll = (courseId: string) => {
    dispatch(unenrollUserFromCourse({ userId: currentUser._id, courseId }));
  };

  const isUserEnrolled = (courseId: string) => {
    return enrollments.some(
      (enrollment: any) =>
        enrollment.user === currentUser._id &&
        enrollment.course === courseId
    );
  };

  // Calculate enrolled courses (enrollmentTrigger forces re-calculation when enrollments change)
  const enrolledCourses = courses.filter((course: any) =>
    enrollments.some(
      (enrollment: any) =>
        enrollment.user === currentUser._id &&
        enrollment.course === course._id
     ));

  // Determine which courses to display
  const coursesToDisplay = showAllCourses ? courses : enrolledCourses;

  return (
    <div id="wd-dashboard" className="p-4">
      {/* User info bar */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
        <div>
          <h5 className="mb-1">Welcome, {currentUser.firstName} {currentUser.lastName}!</h5>
          <small className="text-muted">
            Role: {currentUser.role} | Username: {currentUser.username}
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => setShowAllCourses(!showAllCourses)}
          >
            {showAllCourses ? "My Courses" : "All Courses"}
          </Button>
          <Button variant="outline-danger" onClick={signout}>
            Sign out
          </Button>
        </div>
      </div>

      <h1 id="wd-dashboard-title">Dashboard</h1>
      <hr />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 id="wd-dashboard-published">
          {showAllCourses 
            ? `All Courses (${courses.length})` 
            : `Enrolled Courses (${enrolledCourses.length})`}
        </h2>
        {canEdit && (
          <div>
            <Button
              variant="warning"
              className="me-2"
              id="wd-update-course-click"
              onClick={handleUpdateCourse}
            >
              Update
            </Button>
            <Button
              variant="primary"
              id="wd-add-new-course-click"
              onClick={handleAddNewCourse}
            >
              Add New Course
            </Button>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="mb-4">
          <h5>New Course</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                value={course.name}
                onChange={(e) => setCourse({ ...course, name: e.target.value })}
                placeholder="Enter course name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course Number</Form.Label>
              <Form.Control
                type="text"
                value={course.number}
                onChange={(e) => setCourse({ ...course, number: e.target.value })}
                placeholder="Enter course number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                value={course.department}
                onChange={(e) => setCourse({ ...course, department: e.target.value })}
                placeholder="Enter department"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Credits</Form.Label>
              <Form.Control
                type="number"
                value={course.credits}
                onChange={(e) => setCourse({ ...course, credits: parseInt(e.target.value) || 0 })}
                placeholder="Enter credits"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={course.startDate}
                onChange={(e) => setCourse({ ...course, startDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={course.endDate}
                onChange={(e) => setCourse({ ...course, endDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                value={course.image}
                onChange={(e) => setCourse({ ...course, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Enter course description"
              />
            </Form.Group>
          </Form>
        </div>
      )}
      <hr />

      <div id="wd-dashboard-courses">
        {coursesToDisplay.length === 0 ? (
          <Alert variant="info">
            {showAllCourses 
              ? "No courses available." 
              : "You are not currently enrolled in any courses."}
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {coursesToDisplay.map((course: any) => {
              const isEnrolled = isUserEnrolled(course._id);
              return (
                <Col key={course._id} className="wd-dashboard-course">
                  <Card style={{ width: "300px" }}>
                    {/* Only link to course if user is enrolled */}
                    {isEnrolled ? (
                      <Link
                        to={`/Kambaz/Courses/${course._id}/Home`}
                        className="wd-dashboard-course-link text-decoration-none text-dark"
                      >
                        <Card.Img
                          variant="top"
                          src={course.image || "/images/reactjs.jpg"}
                          width="100%"
                          height={160}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/reactjs.jpg";
                          }}
                        />
                      </Link>
                    ) : (
                      <Card.Img
                        variant="top"
                        src={course.image || "/images/reactjs.jpg"}
                        width="100%"
                        height={160}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/reactjs.jpg";
                        }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">
                        {course.name}
                      </Card.Title>
                      <Card.Text
                        className="wd-dashboard-course-description overflow-hidden"
                        style={{ height: "100px" }}
                      >
                        {course.description}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {isEnrolled ? (
                            <>
                              <Link
                                to={`/Kambaz/Courses/${course._id}/Home`}
                                className="text-decoration-none"
                              >
                                <Button variant="primary" className="me-2">Go</Button>
                              </Link>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleUnenroll(course._id)}
                              >
                                Unenroll
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="success" 
                              onClick={() => handleEnroll(course._id)}
                            >
                              Enroll
                            </Button>
                          )}
                        </div>
                        {canEdit && (
                          <div>
                            <Button
                              variant="warning"
                              className="me-2"
                              size="sm"
                              id="wd-edit-course-click"
                              onClick={(e) => {
                                e.preventDefault();
                                setCourse(course);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              id="wd-delete-course-click"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteCourse(course._id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}
