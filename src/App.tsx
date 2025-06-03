import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import Kambaz from "./Kambaz";
import Landing from "./Landing";
import store from "./Kambaz/store";
import { Provider } from "react-redux";
export default function App() {
 return (
    <Provider store={store}>
      <HashRouter>
        <div>
          <Routes>
      <Route path="/" element={<Navigate to="Landing"/>}/>
      <Route path="/Kambaz/*" element={<Kambaz />} />
      <Route path="/Landing" element={<Landing />} />
      </Routes>
        </div>
      </HashRouter>
    </Provider>
  );
}