import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(7);
  const padding10px = { padding: "10px" };
  const buttonBaseStyle = {
    ...padding10px,
    color: "black",
    border: "none",
    cursor: "pointer",
    margin: "0 5px"
  };
  const upVoteStyle = {
    ...buttonBaseStyle,
    backgroundColor: "lightgreen"
  };
  const downVoteStyle = {
    ...buttonBaseStyle,
    backgroundColor: "lightcoral"
  };

  console.log(count);
  return (
    <div id="wd-counter-use-state">
      <h2>Counter: {count}</h2>
      <button
        style={upVoteStyle}
        onClick={() => { setCount(count + 1); console.log(count); }}
        id="wd-counter-up-click">Up</button>
      <button
        style={downVoteStyle}
        onClick={() => { setCount(count - 1); console.log(count); }}
        id="wd-counter-down-click">Down</button>
      <hr/>
    </div>
  );
}