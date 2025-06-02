import { Col } from "react-bootstrap";

import { Row } from "react-bootstrap";
export default function BootstrapGrids() {
  return (
    <div id="wd-bs-grid-system">
        <h2>Grid system</h2>
    <Row>
        <Col className="bg-danger text-white">
        <h3>Left half</h3>
        </Col>
        <Col className="bg-primary text-white">
        <h3>Right half</h3>
        </Col>
    </Row>
    <Row>
        <Col xs={4} className="bg-warning">
        <h3>One third</h3>
        </Col>
        <Col xs={8} className="bg-success text-white">
        <h3>Two thirds</h3>
        </Col>
    </Row>
    <Row>
        <Col xs={2} className="bg-black text-white">
        <h3>Sidebar</h3>
        </Col>
        <Col xs={8} className="bg-secondary text-white">
        <h3>Main content</h3>
        </Col>
        <Col xs={2} className="bg-info">
        <h3>Sidebar</h3>
        </Col>  </Row>  
    </div>
  );
}