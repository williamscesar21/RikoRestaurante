import React, { useState, useEffect } from "react";
import "../css/Mesero.css";
import { MdDelete } from "react-icons/md";
import { api_base_url } from "../../../ipconfig";

const Mesero = () => {
  const [meseros, setMeseros] = useState([]);
  const [nuevoMesero, setNuevoMesero] = useState({ nombre: "" });
  const API_URL = `${api_base_url}/meseros`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Error al obtener los meseros");
        }

        const meserosData = await response.json();
        setMeseros(meserosData);
      } catch (error) {
        console.error("Error al cargar meseros:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoMesero({ ...nuevoMesero, [name]: value });
  };

  const handleAddMesero = async () => {
    if (nuevoMesero.nombre.trim() === "") {
      return alert("Por favor, ingresa el nombre del mesero");
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoMesero),
      });

      if (!response.ok) {
        throw new Error("Error al agregar mesero");
      }

      const result = await response.json();
      setMeseros([...meseros, { id: result.id, ...nuevoMesero }]);
      setNuevoMesero({ nombre: "" });
    } catch (error) {
      console.error("Error al agregar mesero:", error);
    }
  };

  const handleDeleteMesero = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar mesero");
      }

      setMeseros(meseros.filter((mesero) => mesero.id !== id));
    } catch (error) {
      console.error("Error al eliminar mesero:", error);
    }
  };

  return (
    <div className="meseros-container">
      <h1>Gestión de Meseros</h1>

      <div className="meseros-add">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del mesero"
          value={nuevoMesero.nombre}
          onChange={handleInputChange}
        />
        <button onClick={handleAddMesero}>Agregar</button>
      </div>

      <ul className="meseros-list">
        {meseros.map((mesero) => (
          <li key={mesero.id} className="meseros-item">
            <span>{mesero.nombre}</span>
            <button onClick={() => handleDeleteMesero(mesero.id)}><MdDelete /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Mesero;
