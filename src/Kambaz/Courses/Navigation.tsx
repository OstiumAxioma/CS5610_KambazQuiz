import { ListGroup } from "react-bootstrap";
import { NavLink, useParams } from "react-router-dom";
import { FaHome, FaBook, FaPencilAlt, FaVideo, FaClipboardList, FaQuestionCircle, FaChartBar, FaUsers } from "react-icons/fa";

export default function CourseNavigation() {
  const { cid } = useParams();
  
  const links = [
    { label: "Home", path: `/Kambaz/Courses/${cid}/Home`, icon: FaHome },
    { label: "Modules", path: `/Kambaz/Courses/${cid}/Modules`, icon: FaBook },
    { label: "Piazza", path: `/Kambaz/Courses/${cid}/Piazza`, icon: FaPencilAlt },
    { label: "Zoom", path: `/Kambaz/Courses/${cid}/Zoom`, icon: FaVideo },
    { label: "Assignments", path: `/Kambaz/Courses/${cid}/Assignments`, icon: FaClipboardList },
    { label: "Quizzes", path: `/Kambaz/Courses/${cid}/Quizzes`, icon: FaQuestionCircle },
    { label: "Grades", path: `/Kambaz/Courses/${cid}/Grades`, icon: FaChartBar },
    { label: "People", path: `/Kambaz/Courses/${cid}/People`, icon: FaUsers }
  ];

  return (
    <ListGroup id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((link) => (
        <ListGroup.Item
          key={link.label}
          to={link.path}
          as={NavLink}
          end
          id={`wd-course-${link.label.toLowerCase()}-link`}
          className="text-center border-0 bg-black text-white sidebar-item"
        >
          <link.icon className="fs-2 text-danger mb-1" />
          <div className="sidebar-label">{link.label}</div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
