import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OracleDashboard from "./pages/OracleDashboard";
import LatticePage from "./pages/LatticePage";
import TunerPage from "./pages/TunerPage";
import VerifierPage from "./pages/VerifierPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<OracleDashboard />} />
          <Route path="/lattice" element={<LatticePage />} />
          <Route path="/tuner" element={<TunerPage />} />
          <Route path="/verifier" element={<VerifierPage />} />
        </Routes>
      </div>
    </Router>
  );
}

