import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/Home';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Categoria from './components/Categoria';
import Producto from './components/Producto';
import Cliente from './components/Cliente';
import Mesero from './components/Mesero';
import Ordenes from './components/Ordenes';
import Mesa from './components/Mesas';
import OrdenScreen from './components/OrdenScreen';
import Login from './components/Login';
import Sesiones from './components/Sesiones';
import MesaScreen from './components/MesaScreen';
import SesionScreen from './components/SesionScreen';

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
            <Route path="/mesas" element={<Mesa />} />
            <Route path="/mesas/:mesaId" element={<MesaScreen />} />
            <Route path="/ordenes/:orderId" element={<OrdenScreen />} />
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/categorias" element={isAuthenticated ? <Categoria /> : <Navigate to="/login" />} />
            <Route path="/productos" element={isAuthenticated ? <Producto /> : <Navigate to="/login" />} />
            <Route path="/clientes" element={isAuthenticated ? <Cliente /> : <Navigate to="/login" />} />
            <Route path="/meseros" element={isAuthenticated ? <Mesero /> : <Navigate to="/login" />} />
            <Route path="/ordenes" element={isAuthenticated ? <Ordenes /> : <Navigate to="/login" />} />
            <Route path="/sesiones" element={isAuthenticated ? <Sesiones /> : <Navigate to="/login" />} />
            <Route path="/sesion/:id" element={isAuthenticated ? <SesionScreen /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
