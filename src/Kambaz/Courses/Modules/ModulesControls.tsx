import { useState } from "react";
import { FaChevronDown, FaEye, FaPlus } from "react-icons/fa6";
import GreenCheckmark from "./GreenCheckmark";
import { Button, Dropdown } from "react-bootstrap";
import ModuleEditor from "./ModuleEditor";

export default function ModulesControls({
  moduleName,
  setModuleName,
  addModule,
}: {
  moduleName: string;
  setModuleName: (title: string) => void;
  addModule: () => void;
}) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
      return (
      <div id="wd-modules-controls" className="d-flex justify-content-end gap-2 mb-3">
        <Button variant="danger" size="lg" id="wd-add-module-btn" onClick={handleShow}>
          <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
          Module
        </Button>
      <Dropdown>
        <Dropdown.Toggle variant="secondary" size="lg" id="wd-publish-all-btn">
          <GreenCheckmark /> Publish All
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item id="wd-publish-all">
            <GreenCheckmark /> Publish All
          </Dropdown.Item>
          <Dropdown.Item id="wd-publish-all-modules-and-items">
            <GreenCheckmark /> Publish all modules and items
          </Dropdown.Item>
          <Dropdown.Item id="wd-publish-modules-only">
            <GreenCheckmark /> Publish modules only
          </Dropdown.Item>
          <Dropdown.Item id="wd-unpublish-all-modules-and-items">
            <GreenCheckmark /> Unpublish all modules and items
          </Dropdown.Item>
          <Dropdown.Item id="wd-unpublish-modules-only">
            <GreenCheckmark /> Unpublish modules only
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Button variant="secondary" size="lg" id="wd-view-progress">
        <FaEye className="position-relative me-2" style={{ bottom: "1px" }} />
        View Progress
      </Button>
              <Button variant="secondary" size="lg" id="wd-collapse-all">
          <FaChevronDown className="position-relative me-2" style={{ bottom: "1px" }} />
          Collapse All
        </Button>
        
        <ModuleEditor
          show={show}
          handleClose={handleClose}
          dialogTitle="Add Module"
          moduleName={moduleName}
          setModuleName={setModuleName}
          addModule={addModule}
        />
      </div>
    );
  }
