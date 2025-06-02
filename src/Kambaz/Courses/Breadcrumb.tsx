import { useLocation } from "react-router-dom";

export default function Breadcrumb({ course }: { course?: any }) {
  const location = useLocation();
  
  // Get the current section from the pathname
  const pathParts = location.pathname.split("/");
  const currentSection = pathParts[pathParts.length - 1];

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <span className="text-danger">{course?.name || "Course Not Found"}</span>
        </li>
        {currentSection !== "Home" && (
          <li className="breadcrumb-item active" aria-current="page">
            {currentSection}
          </li>
        )}
      </ol>
    </nav>
  );
} 