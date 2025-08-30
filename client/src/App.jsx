import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Footer from "./component/Footer";
import Loading from "./component/Loading";
import Navbar from "./component/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Review from "./pages/Review";
import Register from "./pages/Register";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Router>
      <div className="app"> {/* Add this wrapper with flexbox */}
        <Navbar />
        
        <main className="main-content"> {/* Content grows to fill space */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />}/>
            <Route path="/profile" element={<Profile />} />
            <Route 
              path="/review" 
              element={<Review isLoading={isLoading} setIsLoading={setIsLoading} />} 
            />
          </Routes>
        </main>
        
        <Footer /> {/* Footer stays at bottom */}
        
        <Toaster />
        <Loading isLoading={isLoading} />
      </div>
    </Router>
  );
}

export default App;
