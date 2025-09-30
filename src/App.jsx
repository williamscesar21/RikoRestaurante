import React, { useState } from 'react';
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

  // ✅ Solo verificamos si hay token en localStorage
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      <div className="container">
        {/* Header siempre visible */}
        { isAuthenticated && <Header toggleSidebar={toggleSidebar} />}

        {/* Sidebar solo si está autenticado */}
        {isAuthenticated && (
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/mesas" element={<Mesa />} />
            <Route path="/mesas/:mesaId" element={<MesaScreen />} />
            <Route path="/ordenes/:orderId" element={<OrdenScreen />} />

            {/* Rutas protegidas → solo validamos si está logueado */}
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/categorias"
              element={isAuthenticated ? <Categoria /> : <Navigate to="/login" />}
            />
            <Route
              path="/productos"
              element={isAuthenticated ? <Producto /> : <Navigate to="/login" />}
            />
            <Route
              path="/clientes"
              element={isAuthenticated ? <Cliente /> : <Navigate to="/login" />}
            />
            <Route
              path="/meseros"
              element={isAuthenticated ? <Mesero /> : <Navigate to="/login" />}
            />
            <Route
              path="/ordenes"
              element={isAuthenticated ? <Ordenes /> : <Navigate to="/login" />}
            />
            <Route
              path="/sesiones"
              element={isAuthenticated ? <Sesiones /> : <Navigate to="/login" />}
            />
            <Route
              path="/sesion/:id"
              element={isAuthenticated ? <SesionScreen /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
