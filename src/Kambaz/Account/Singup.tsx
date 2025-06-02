import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "./reducer";
import * as db from "../Database";

export default function Signup() {
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
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const signup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate input
    if (!user.username || !user.password || !user.firstName || !user.lastName || !user.email) {
      setError("Please fill in all required fields");
      return;
    }

    if (user.password !== user.verifyPassword) {
      setError("Passwords do not match");
      return;
    }

    if (user.password.length < 3) {
      setError("Password must be at least 3 characters long");
      return;
    }

    // Check if username already exists
    const existingUser = db.users.find((u: any) => u.username === user.username);
    if (existingUser) {
      setError("Username already exists");
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

    // Add to database (in real app, should call API)
    db.users.push(newUser);

    // Auto-login new user
    dispatch(setCurrentUser(newUser));
    
    alert("Registration successful!");
    navigate("/Kambaz/Dashboard");
  };

  return (
    <div id="wd-signup-screen">
      <h1>Sign up</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      
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
          Sign up
        </Button>
      </Form>
      
      <Link 
        to="/Kambaz/Account/Signin"
        className="btn btn-link w-100"
      >
        Already have an account? Sign in
      </Link>
    </div>
  );
}
