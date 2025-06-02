import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AccountNavigation() {
  const location = useLocation();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const links = currentUser ? ["Profile"] : ["Signin", "Signup"];
  
  // Debug info
  console.log("AccountNavigation - currentUser:", currentUser);
  console.log("AccountNavigation - links:", links);
  
  const navItems = [
    { path: "Signin", label: "Signin" },
    { path: "Signup", label: "Signup" },
    { path: "Profile", label: "Profile" }
  ];

  // Filter navItems to only include items that are in the links array
  const filteredNavItems = navItems.filter(item => links.includes(item.path));
  
  console.log("AccountNavigation - filteredNavItems:", filteredNavItems);

  return (
    <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
      {filteredNavItems.map((item) => (
        <Link
          key={item.path}
          to={`/Kambaz/Account/${item.path}`}
          id={`wd-account-${item.path.toLowerCase()}-link`}
          className={`list-group-item border-0 d-flex align-items-center ${
            location.pathname.includes(item.path) ? "active" : "text-danger"
          }`}
        >
          <span className="flex-grow-1">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
