export default function IfElse() {
    let true1 = true, false1 = false;
    let string1 = "string1";
    let string2 = "string2"; 
    let errorFlag = true;
    let result;
    if (errorFlag) {
        result = string1;
    } else {
        result = string2;
    }
    return (
       <div id="wd-if-else">
          <h4>If Else</h4>
          { true1 && <p>true1</p> }
          { !false1 ? <p>!false1</p> : <p>false1</p> }
          <p>Result: {result}</p> <hr/>
       </div>
    )   
    
}