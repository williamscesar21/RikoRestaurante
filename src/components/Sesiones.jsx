import React, { useState, useEffect } from "react";
import "../css/Sesiones.css";
import ModalConfirmacion from "./ModalConfirmacion";
import { Link } from "react-router-dom";
import { api_base_url } from "../../../ipconfig";

const Sesiones = () => {
  const [sesiones, setSesiones] = useState([]);
  const [sesionAbierta, setSesionAbierta] = useState(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  useEffect(() => {
    fetchSesiones();
  }, []);

  const fetchSesiones = async () => {
    try {
      const response = await fetch(`${api_base_url}/sesiones`);
      const data = await response.json();
      const abierta = data.find((sesion) => sesion.estado === "abierta");
      setSesionAbierta(abierta || null);
      const cerradas = data.filter((sesion) => sesion.estado === "cerrada");
      setSesiones(cerradas);
    } catch (err) {
      setError("Error al cargar las sesiones");
    }
  };

  const abrirSesion = async () => {
    if (sesionAbierta) {
      setError("Ya hay una sesión abierta. Ciérrala antes de abrir otra.");
      return;
    }

    try {
      const response = await fetch(`${api_base_url}/sesiones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "abierta" }),
      });

      if (response.ok) {
        const nuevaSesion = await response.json();
        setSesionAbierta({ id: nuevaSesion.id, estado: "abierta" });
        setError("");
        fetchSesiones();
      } else {
        setError("No se pudo abrir la sesión.");
      }
    } catch (err) {
      setError("Error al abrir la sesión.");
    }
  };

  // Función para abrir el modal de confirmación
  const handleCerrarSesion = () => {
    if (!sesionAbierta) {
      setError("No hay una sesión abierta para cerrar.");
      return;
    }
    setIsModalOpen(true); // Abre el modal
  };

  // Función para confirmar el cierre de sesión
  const confirmarCerrarSesion = async () => {
    try {
      const response = await fetch(`${api_base_url}/sesiones/${sesionAbierta.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "cerrada" }),
      });

      if (response.ok) {
        setSesiones((prev) => [...prev, { ...sesionAbierta, estado: "cerrada" }]);
        setSesionAbierta(null);
        setError("");
      } else {
        setError("No se pudo cerrar la sesión.");
      }
    } catch (err) {
      setError("Error al cerrar la sesión.");
    } finally {
      setIsModalOpen(false); // Cierra el modal
    }
  };

  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };
  

  return (
    <div className="sesiones-container">
      <h1>Gestión de Sesiones</h1>

      {error && <p className="error-message">{error}</p>}

      {sesionAbierta ? (
        <>
        <Link className="sesion-abierta" to={`/sesion/${sesionAbierta.id}`}>
          <p className="sesion-id">
            Sesión abierta: <strong> {sesionAbierta.id}</strong>
          </p>
          
        </Link>
        <button onClick={handleCerrarSesion} className="sesion-button close">
            Cerrar Sesión
          </button>
          </>
      ) : (
        <button onClick={abrirSesion} className="sesion-button open">
          Abrir Sesión
        </button>
      )}

      <h3>Sesiones Cerradas</h3>
      {sesiones.length > 0 ? (
        <ul className="sesiones-list">
          {sesiones.map((sesion) => (
            <Link className="sesiones-list-link" to={`/sesion/${sesion.id}`} key={sesion.id}>
            <div className="sesion-number">{sesion.id} </div>
            <div className="sesion-state">
                {sesion.fecha ? formatearFecha(sesion.fecha) : "Fecha no disponible"}
            </div>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No hay sesiones cerradas.</p>
      )}

      {/* Modal de confirmación */}
      <ModalConfirmacion
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmarCerrarSesion}
        message="¿Estás seguro de que deseas cerrar la sesión?"
      />
    </div>
  );
};

export default Sesiones;