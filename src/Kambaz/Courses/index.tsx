import CourseNavigation from "./Navigation";
import { Navigate, Route, Routes, useParams } from "react-router";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/editor";
import EditAssignment from "./Assignments/EditAssignment";
import { FaAlignJustify } from "react-icons/fa";
import PeopleTable from "./People/Table";
import Breadcrumb from "./Breadcrumb";
import { useSelector } from "react-redux";
import { Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

// import { courses } from "../Database";
export default function Courses() {
  const { cid } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { courses } = useSelector((state: any) => state.coursesReducer);
  const { enrollments } = useSelector((state: any) => state.enrollmentsReducer);
  const course = courses.find((course: any) => course._id === cid);

  // Check if current user is enrolled in this course
  const isEnrolled = enrollments.some(
    (enrollment: any) =>
      enrollment.user === currentUser._id &&
      enrollment.course === cid
  );

  // Check if current user has edit permissions (FACULTY or ADMIN)
  const canEdit = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  // If user is not enrolled and not faculty/admin, redirect to dashboard
  if (!isEnrolled && !canEdit) {
    return (
      <div className="container mt-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>
            You are not enrolled in this course. Please enroll in the course from the Dashboard to access the content.
          </p>
          <hr />
          <div className="d-flex justify-content-center">
            <Link to="/Kambaz/Dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  // If course doesn't exist
  if (!course) {
    return (
      <div className="container mt-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Course Not Found</Alert.Heading>
          <p>
            The course you're looking for doesn't exist or has been removed.
          </p>
          <hr />
          <div className="d-flex justify-content-center">
            <Link to="/Kambaz/Dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div id="wd-courses">
      <div className="d-flex align-items-center mb-3">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
        <Breadcrumb course={course} />
      </div>
      <div className="d-flex">
        <div className="d-none d-md-block">
          <CourseNavigation />
        </div>
        <div className="flex-fill">
          <Routes>
            <Route path="/" element={<Navigate to="Home" />} />
            <Route path="Home" element={<Home />} />
            <Route path="Modules" element={<Modules />} />
            <Route path="Assignments" element={<Assignments />} />
            <Route path="Assignments/:aid" element={<AssignmentEditor />} />
            <Route path="Assignments/:aid/edit" element={<EditAssignment />} />
            <Route path="Assignments/new/edit" element={<EditAssignment />} />
            <Route path="People" element={<PeopleTable />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
//Test git change
