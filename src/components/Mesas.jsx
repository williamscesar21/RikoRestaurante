import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Mesa.css";
import { MdDelete } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import ModalConfirmacion from "./ModalConfirmacion"; // Asegúrate de importar el modal
import { api_base_url } from "../../../ipconfig";

const Mesa = () => {
  const [mesas, setMesas] = useState([]);
  const [newMesa, setNewMesa] = useState({ numero: "", capacidad: "", estado: "libre" });
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [mesaToUpdate, setMesaToUpdate] = useState(null); // Mesa que se va a actualizar
  const userRole = localStorage.getItem('rol');
  const navigate = useNavigate();

  const API_URL = `${api_base_url}/mesas`;

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Error al obtener las mesas");
        }
        const data = await response.json();
        setMesas(data);
      } catch (error) {
        console.error("Error al cargar mesas:", error);
      }
    };

    fetchMesas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMesa({ ...newMesa, [name]: value });
  };

  const handleAddMesa = async () => {
    if (!newMesa.numero || !newMesa.capacidad) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMesa),
      });

      if (!response.ok) {
        throw new Error("Error al agregar la mesa");
      }

      const result = await response.json();
      setMesas([...mesas, { id: result.id, ...newMesa }]);
      setNewMesa({ numero: "", capacidad: "", estado: "libre" });
    } catch (error) {
      console.error("Error al agregar mesa:", error);
    }
  };

  const handleDeleteMesa = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la mesa");
      }

      setMesas(mesas.filter((mesa) => mesa.id !== id));
    } catch (error) {
      console.error("Error al eliminar mesa:", error);
    }
  };

  const handleMesaClick = (id) => {
    navigate(`/mesas/${id}`);
  };

  // Manejar la apertura del modal
  const handleUpdateMesa = (id, nuevoEstado) => {
    setMesaToUpdate({ id, nuevoEstado }); // Guardar la mesa que se va a actualizar
    setIsModalOpen(true); // Abrir el modal
  };

  // Confirmar el cambio de estado
  const confirmUpdateMesa = async () => {
    if (mesaToUpdate) {
      const { id, nuevoEstado } = mesaToUpdate;
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el estado de la mesa");
        }

        setMesas(mesas.map((mesa) => (mesa.id === id ? { ...mesa, estado: nuevoEstado } : mesa)));
      } catch (error) {
        console.error("Error al actualizar estado de la mesa:", error);
      } finally {
        setIsModalOpen(false); // Cerrar el modal después de la confirmación
        setMesaToUpdate(null); // Reiniciar la mesa a actualizar
      }
    }
  };

  return (
    <div className="mesa-container">
      <h1>Mesas</h1>

      {(userRole === "admin" || userRole === "mesero") && (
        <div className="mesa-form">
          <input
            type="text"
            name="numero"
            placeholder="Número"
            value={newMesa.numero}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="capacidad"
            placeholder="Capacidad"
            value={newMesa.capacidad}
            onChange={handleInputChange}
          />
          <button onClick={handleAddMesa}>Agregar</button>
        </div>
      )}

      <ul className="mesa-list">
        {mesas.map((mesa) => (
          <li
            key={mesa.id}
            className={`mesa-item ${mesa.estado === "libre" ? "mesa-libre" : "mesa-ocupada"}`}
            onClick={() => handleMesaClick(mesa.id)}
          >
            <div className="mesa-number">{mesa.id}</div>
            <div className="mesa-capacity">Capacidad: {mesa.capacidad} <IoPeople /></div>
            <div className="mesa-status">Estado: {mesa.estado}</div>
            {(userRole === "admin" || userRole === "mesero") && (
              <button onClick={(e) => { e.stopPropagation(); handleUpdateMesa(mesa.id, mesa.estado === "libre" ? "ocupada" : "libre"); }}>
                Cambiar Estado
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Modal de confirmación */}
      <ModalConfirmacion
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmUpdateMesa}
        message={`¿Estás seguro de que deseas cambiar el estado de la mesa ${mesaToUpdate ? mesaToUpdate.id : ''} a ${mesaToUpdate ? mesaToUpdate.nuevoEstado : ''}?`}
      />
    </div>
  );
};

export default Mesa;