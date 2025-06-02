import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "./counterReducer";

export default function CounterRedux() {
  const count = useSelector((state: any) => state.counterReducer.count);
  const dispatch = useDispatch();

  return (
    <div>
      <h3>Counter Redux Example</h3>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
    </div>
  );
} 