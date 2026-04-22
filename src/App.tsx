import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LatticePage from "./pages/LatticePage";
import TunerPage from "./pages/TunerPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LatticePage />} />
          <Route path="/tuner" element={<TunerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

