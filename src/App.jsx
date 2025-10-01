import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Producto from './components/Producto';
import Ordenes from './components/Ordenes';
import Login from './components/Login';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const [swStatus, setSwStatus] = useState("Esperando...");

  useEffect(() => {
    console.log("🔍 useEffect montado, verificando ServiceWorker...");
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          console.log("✅ SW registrado correctamente:", registration);
          setSwStatus("Registrado OK");
        })
        .catch((err) => {
          console.error("❌ Error registrando SW:", err);
          setSwStatus("Error: " + err.message);
        });
    } else {
      console.warn("⚠️ Este navegador no soporta serviceWorker");
      setSwStatus("No soportado");
    }
  }, []);


  return (
    <BrowserRouter>
      <div className="container">
        {isAuthenticated && <Header toggleSidebar={toggleSidebar} />}
        {isAuthenticated && (
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        )}
        <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/productos" element={isAuthenticated ? <Producto /> : <Navigate to="/login" />} />
            <Route path="/ordenes" element={isAuthenticated ? <Ordenes /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
