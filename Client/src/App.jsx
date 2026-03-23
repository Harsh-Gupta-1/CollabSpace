import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppToastContainer from "./components/AppToastContainer";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Dashboard from "./pages/Dashboard";
function App() {
  return (
    <Router>
      <AppToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
