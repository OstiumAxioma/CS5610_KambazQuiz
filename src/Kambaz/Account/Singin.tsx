import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setCurrentUser } from "./reducer";
import { useDispatch } from "react-redux";
import * as db from "../Database";
import { FormControl, Button, Alert } from "react-bootstrap";

export default function Signin() {
  const [credentials, setCredentials] = useState<any>({ username: "", password: "" });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const signin = () => {
    setError("");
    
    if (!credentials.username || !credentials.password) {
      setError("Please enter username and password");
      return;
    }
    
    console.log("Sign in attempt, credentials:", credentials);
    console.log("Available users in database:", db.users);
    console.log("Looking for user with username:", credentials.username);
    
    const user = db.users.find(
      (u: any) => u.username === credentials.username && u.password === credentials.password);
    
    if (!user) {
      console.log("User not found. Checking individual matches:");
      const usernameMatch = db.users.find((u: any) => u.username === credentials.username);
      if (usernameMatch) {
        console.log("Username found but password mismatch. Expected:", usernameMatch.password, "Got:", credentials.password);
      } else {
        console.log("Username not found in database");
      }
      setError("Invalid username or password!");
      return;
    }
    
    console.log("Sign in successful, user:", user);
    dispatch(setCurrentUser(user));
    navigate("/Kambaz/Dashboard");
  };
  
  return (
    <div id="wd-signin-screen">
      <h1>Sign in</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Debug info - showing users count and first few usernames */}
      <div className="mb-3 p-2 bg-info text-white rounded">
        <small>
          Debug: Database loaded {db.users.length} users<br/>
          First 3 usernames: {db.users.slice(0, 3).map(u => u.username).join(', ')}
        </small>
      </div>
      
      <FormControl 
        value={credentials.username || ""}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        className="mb-2" 
        placeholder="Username" 
        id="wd-username" 
      />
      <FormControl 
        value={credentials.password || ""}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        className="mb-2" 
        placeholder="Password" 
        type="password" 
        id="wd-password" 
      />
      <Button onClick={signin} id="wd-signin-btn" className="w-100 mb-2">
        Sign in
      </Button>
      
      <div className="text-center">
        <Link id="wd-signup-link" to="/Kambaz/Account/Signup">
          Don't have an account? Sign up
        </Link>
      </div>
      
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
  );
}
