import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProjectMembers from './pages/ProjectMembers';
import NikoNikoCalendar from './pages/NikoNikoCalendar';
import SprintManagement from './pages/SprintManagement';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:projectId" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/projeto/:id_projeto/membros" element={<ProjectMembers />} />
          <Route path="/projeto/:id_projeto/niko-niko" element={<NikoNikoCalendar />} />
          <Route path="/projeto/:id_projeto/sprints" element={<SprintManagement />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;