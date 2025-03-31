import {BrowserRouter, Route, Routes} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './assets/components/Navbar.tsx';
import Home from "./assets/components/Home.tsx"; 
import Acquisition from './assets/components/Acquisition.tsx'; 
import Preservation from './assets/components/Preservation.tsx';
import Analysis from './assets/components/Analysis.tsx';
import Presentation from './assets/components/Presentation.tsx';

function App() {
  
  const [tokenAuth, setTokenAuth] = useState<string | null>(localStorage.getItem("authToken"));
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem("role");

    if (storedToken) setTokenAuth(storedToken);
    if (storedUser) setUser(storedUser);
    if (storedRole) setRole(storedRole);

  }, []);
//----------------------------------------
  return (
    <div className="flex flex-col">
      <BrowserRouter>
        <Navbar 
        tokenAuth={tokenAuth} 
        setTokenAuth={setTokenAuth} 
        user={user || ""} setUser={setUser} 
        role={role || ""} setRole={setRole} />

        <Routes>
          <Route path="/" element={<Home tokenAuth={tokenAuth} setTokenAuth={setTokenAuth} setUser={setUser} setRole={setRole}/>} />
          <Route path="/acquisition" element={<Acquisition />} />
          <Route path="/preservation" element={<Preservation />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/presentation" element={<Presentation />} />
        </Routes>
      </BrowserRouter>  

    </div>
  );
}

export default App

