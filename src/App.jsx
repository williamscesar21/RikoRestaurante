import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./components/Home";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Producto from "./components/Producto";
import Ordenes from "./components/Ordenes";
import Login from "./components/Login";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const restaurantId = localStorage.getItem("restaurantId");

  // ✅ Monitorear pedidos cada X segundos
  useEffect(() => {
    if (!restaurantId) return;

    const checkPedidos = async () => {
      try {
        const res = await fetch(
          `https://rikoapi.onrender.com/api/pedido/pedidos/restaurante/${restaurantId}`
        );
        const pedidos = await res.json();

        const currentCount = pedidos.length;
        const prevCount = parseInt(localStorage.getItem("pedidosCount") || "0");

        // Si hay más pedidos que antes → notificación
        if (currentCount > prevCount) {
          toast.info("🛎️ ¡Nuevo pedido recibido!");
        }

        // Guardar nuevo valor
        localStorage.setItem("pedidosCount", currentCount);
      } catch (err) {
        console.error("❌ Error al obtener pedidos:", err);
      }
    };

    // Primera vez
    checkPedidos();

    // Repetir cada 10 segundos
    const interval = setInterval(checkPedidos, 1000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  return (
    <BrowserRouter>
      <div className="container">
        {isAuthenticated && <Header toggleSidebar={toggleSidebar} />}
        {isAuthenticated && (
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/productos"
              element={
                isAuthenticated ? <Producto /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/ordenes"
              element={
                isAuthenticated ? <Ordenes /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Contenedor de notificaciones */}
      <ToastContainer position="top-right" autoClose={10000} />
    </BrowserRouter>
  );
}

export default App;
