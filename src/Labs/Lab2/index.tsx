import "./index.css";
import ForegroundColors from "./ForegroundColors";
import BackgroundColors from "./BackgroundColors";
import Borders from "./Borders";
import Padding from "./Padding";
import Margins from "./Margins";
import Corners from "./Corners";
import Dimensions from "./Dimensions";
import Positions from "./Positions";
import Positions2 from "./Positions2";
import Positions3 from "./Positions3";
import Zindex from "./Zindex";
import Float from "./Float";
import GridLayout from "./GridLayout";
import Flex from "./Flex";
import ReactIcons from "./ReactIcons";
import { Container } from "react-bootstrap";
import BootstrapGrids from "./BootstrapGrids";
import BootstrapGrids2 from "./BootstrapGrids2";
import BootstrapGrids3 from "./BootstrapGrids3";
import BootstrapTables from "./BootstrapTables";
import BootstrapLists from "./BootstrapLists";
import BootstrapForms from "./BootstrapForms";
import BootstrapNavigation from "./BootstrapNavigation";

export default function Lab2() {
  return (
    <Container>
    <div id="wd-lab2">
      <h2>Lab 2 - Cascading Style Sheets</h2>
      <h3>Styling with the STYLE attribute</h3>
      <div id="wd-css-id-selectors">
        <h3>ID selectors</h3>
        <p id="wd-id-selector-1"> Instead of changing the look and feel of all the elements of the same name, e.g., P, we can refer to a specific element by its ID
        </p> 
        <p id="wd-id-selector-2"> Here's another paragraph using a different ID and a different look and feel
        </p>
      </div>
      <div id="wd-css-class-selectors">
        <h3>Class selectors</h3>
        <p className="wd-class-selector">
        Instead of using IDs to refer to elements, you can use an element's CLASS attribute
        </p>
        <h4 className="wd-class-selector">
          This heading has same style as paragraph above.
        </h4>
      </div>
      <div id="wd-css-document-selectors">
        <div className="wd-selector-1">
          <h3>Document Structure Selectors</h3>
          <div className="wd-selector-2">
            Selectors can be combined to refer elements in partivular places in the document.
            <p className="wd-selector-3">
            This paragraph's red background is referenced as
            <br />.selector-2 .selector3<br />
            meaning the descendant of some ancestor.<br />
            <span className="wd-selector-4">
              Whereas this span is a direct child of its parent
            </span><br />
            You can combine these relationships to create specific styles depending on the document structure
            </p>
          </div>
        </div>
      </div>
      <ForegroundColors />
      <BackgroundColors />
      <Borders />
      <Padding />
      <Margins />
      <Corners />
      <Dimensions />
      <Positions />
      <Positions2 />
      <Positions3 />
      <Zindex />
      <Float />
      <GridLayout />
      <Flex />
      <ReactIcons />
      <BootstrapGrids />
      <BootstrapGrids2 />
      <BootstrapGrids3 />
      <BootstrapTables />
      <BootstrapLists />
      <BootstrapForms />
      <BootstrapNavigation />
    </div>
    </Container>
  );
}
