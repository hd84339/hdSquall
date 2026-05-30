import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Authentication from "./pages/authentication.jsx";
import "./App.css";
import VideoMeetComponent from "./pages/VideoMeet.jsx";


function App() {
  return (
    
      
      <Routes>
        {/* <Route path="/home" element={< />} /> */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/:url" element={<VideoMeetComponent/>} />
      </Routes>
      
    
  );
}

export default App;



