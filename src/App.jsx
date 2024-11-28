import { useState, useEffect } from 'react';
import './assets/style/App.scss';
import Cookies from "js-cookie";

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Auth from './Pages/Auth/Auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!Cookies.get('authToken');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Загрузка...</div>; 
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={<Auth onAuthSuccess={() => setIsAuthenticated(true)} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
