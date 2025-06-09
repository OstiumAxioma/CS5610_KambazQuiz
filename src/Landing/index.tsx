import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Container, Form, Button, Alert, Tab, Tabs } from "react-bootstrap";
import { setCurrentUser } from "../Kambaz/Account/reducer";
import * as db from "../Kambaz/Database";

export default function Landing() {
  const [activeTab, setActiveTab] = useState("signin");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sign in state
  const [credentials, setCredentials] = useState<any>({ username: "", password: "" });
  const [signinError, setSigninError] = useState("");

  // Sign up state
  const [user, setUser] = useState({
    username: "",
    password: "",
    verifyPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    role: "STUDENT"
  });
  const [signupError, setSignupError] = useState("");

  const signin = () => {
    setSigninError("");
    
    if (!credentials.username || !credentials.password) {
      setSigninError("Please enter username and password");
      return;
    }
    
          console.log("Sign in attempt, credentials:", credentials);
      console.log("Available users in database:", db.users);
    
    const foundUser = db.users.find(
      (u: any) => u.username === credentials.username && u.password === credentials.password);
    
          if (!foundUser) {
        console.log("User not found. Checking individual matches:");
        const usernameMatch = db.users.find((u: any) => u.username === credentials.username);
        if (usernameMatch) {
          console.log("Username found but password mismatch");
        } else {
          console.log("Username not found in database");
        }
        setSigninError("Invalid username or password!");
        return;
      }
    
          console.log("Sign in successful, user:", foundUser);
    dispatch(setCurrentUser(foundUser));
    navigate("/Kambaz/Dashboard");
  };

  const signup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    // Validate input
    if (!user.username || !user.password || !user.firstName || !user.lastName || !user.email) {
      setSignupError("Please fill in all required fields");
      return;
    }

    if (user.password !== user.verifyPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    if (user.password.length < 3) {
      setSignupError("Password must be at least 3 characters long");
      return;
    }

    // Check if username already exists
    const existingUser = db.users.find((u: any) => u.username === user.username);
    if (existingUser) {
      setSignupError("Username already exists");
      return;
    }

    // Create new user
    const newUser = {
      _id: new Date().getTime().toString(),
      username: user.username,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dob: user.dob || new Date().toISOString().split('T')[0],
      role: user.role,
      loginId: `00${new Date().getTime()}S`,
      section: "S101",
      lastActivity: new Date().toISOString().split('T')[0],
      totalActivity: "00:00:00"
    };

    console.log("Creating new user:", newUser);

    // Add to database
    db.users.push(newUser);

    // Auto-login new user
    dispatch(setCurrentUser(newUser));
    
    alert("Registration successful!");
    navigate("/Kambaz/Dashboard");
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="p-4 bg-light rounded shadow-sm" style={{ maxWidth: "500px", width: "100%" }}>
        <h1 className="text-center mb-4 text-primary">Welcome to Kambaz</h1>
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "signin")}
          className="nav-justified mb-4"
        >
          {/* Sign in tab */}
          <Tab eventKey="signin" title="Sign In">
            <div id="wd-signin-screen" className="mt-3">
              {signinError && <Alert variant="danger">{signinError}</Alert>}
              
              {/* Debug info */}
              <div className="mb-3 p-2 bg-info text-white rounded">
                <small>
                  Debug: Database loaded {db.users.length} users<br/>
                  First 3 usernames: {db.users.slice(0, 3).map(u => u.username).join(', ')}
                </small>
              </div>
              
              <Form>
                <Form.Control 
                  value={credentials.username || ""}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="mb-2" 
                  placeholder="Username" 
                  id="wd-username" 
                />
                <Form.Control 
                  value={credentials.password || ""}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="mb-2" 
                  placeholder="Password" 
                  type="password" 
                  id="wd-password" 
                />
                <Button onClick={signin} id="wd-signin-btn" className="w-100 mb-2">
                  Sign In
                </Button>
              </Form>
              
              <hr />
                              <div className="mt-3">
                  <small className="text-muted">
                    <strong>Test Accounts:</strong><br />
                    <strong>FACULTY:</strong> iron_man / stark123, ring_bearer / shire123<br />
                    <strong>STUDENT:</strong> dark_knight / wayne123, thor_odinson / mjolnir123<br />
                    <strong>TA:</strong> black_widow / romanoff123, strider / aragorn123<br />
                    <strong>ADMIN:</strong> ada / 123
                  </small>
                </div>
            </div>
          </Tab>

          {/* Sign up tab */}
          <Tab eventKey="signup" title="Sign Up">
            <div id="wd-signup-screen" className="mt-3">
              {signupError && <Alert variant="danger">{signupError}</Alert>}
              
              <Form onSubmit={signup}>
                <Form.Control 
                  value={user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  placeholder="Username *" 
                  className="wd-username mb-2"
                  required
                />
                <Form.Control 
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="Password *" 
                  type="password" 
                  className="wd-password mb-2"
                  required
                />
                <Form.Control 
                  value={user.verifyPassword}
                  onChange={(e) => setUser({ ...user, verifyPassword: e.target.value })}
                  placeholder="Verify Password *"
                  type="password" 
                  className="wd-password-verify mb-2"
                  required
                />
                <Form.Control 
                  value={user.firstName}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  placeholder="First Name *" 
                  className="mb-2"
                  required
                />
                <Form.Control 
                  value={user.lastName}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  placeholder="Last Name *" 
                  className="mb-2"
                  required
                />
                <Form.Control 
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="Email *" 
                  type="email"
                  className="mb-2"
                  required
                />
                <Form.Control 
                  value={user.dob}
                  onChange={(e) => setUser({ ...user, dob: e.target.value })}
                  placeholder="Date of Birth" 
                  type="date"
                  className="mb-2"
                />
                <Form.Select 
                  value={user.role}
                  onChange={(e) => setUser({ ...user, role: e.target.value })}
                  className="mb-2"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="TA">Teaching Assistant</option>
                  <option value="ADMIN">Administrator</option>
                </Form.Select>
                
                <Button 
                  type="submit"
                  className="btn btn-primary w-100 mb-2"
                >
                  Sign Up
                </Button>
              </Form>
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}
