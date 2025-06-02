import { Link } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
//A3 Start
export default function Signin() {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="p-4 bg-light rounded shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <h1 className="text-center mb-4">Welcome to Zhong Yun's Kambaz</h1>
        <h3 className="text-center mb-3">Sign in</h3>
        <Form>
          <Form.Group className="mb-3">
            <Form.Control
              className="wd-username"
              type="text"
              placeholder="Username"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              className="wd-password"
              type="password"
              placeholder="Password"
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Link to="/Kambaz/Dashboard" className="text-decoration-none">
              <Button
                id="wd-signin-btn"
                variant="primary"
                className="w-100 mb-2"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/Kambaz/Account/Signup" className="text-decoration-none">
              <Button
                id="wd-signup-link"
                variant="outline-secondary"
                className="w-100 mb-2"
              >
                Sign up
              </Button>
            </Link>
            <Link to="/Labs/Lab1" className="text-decoration-none">
              <Button
                id="wd-signup-link"
                variant="outline-info"
                className="w-100"
              >
                Go To Labs Exercises
              </Button>
            </Link>
          </div>
        </Form>
      </div>
    </Container>
  );
}
