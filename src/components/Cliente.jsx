import React, { useState, useEffect } from "react";
import "../css/Cliente.css";
import { MdDelete } from "react-icons/md";
import { api_base_url } from "../../../ipconfig";

const Cliente = () => {
  const [clientes, setClientes] = useState([]);
  const [newCliente, setNewCliente] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    nro_ordenes: 0,
  });

  const [activeField, setActiveField] = useState("");

  const API_URL = `${api_base_url}/clientes`;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Error al obtener clientes");
        }

        const clientesData = await response.json();
        setClientes(clientesData);

        // Obtener la cantidad de órdenes para cada cliente
        const updatedClientes = await Promise.all(clientesData.map(async (cliente) => {
          const ordenesResponse = await fetch(`${api_base_url}/ordenes/cliente/${cliente.id}`);
          const ordenesData = await ordenesResponse.json();
          return { ...cliente, nro_ordenes: ordenesData.length }; // Asumiendo que ordenesData es un array
        }));

        setClientes(updatedClientes);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCliente({ ...newCliente, [name]: value });
  };

  const handleAddCliente = async () => {
    const { nombre, cedula, telefono } = newCliente;

    if (nombre.trim() === "" || cedula.trim() === "" || telefono.trim() === "")
      return alert("Por favor completa todos los campos obligatorios");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCliente),
      });

      if (!response.ok) {
        throw new Error("Error al agregar el cliente");
      }

      const result = await response.json();
      setClientes([...clientes, { id: result.id, ...newCliente }]);
      setNewCliente({ nombre: "", cedula: "", telefono: "", nro_ordenes: 0 });
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  };

  const handleDeleteCliente = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el cliente");
      }

      setClientes(clientes.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const handleNumberClick = (number) => {
    if (activeField) {
      setNewCliente({
        ...newCliente,
        [activeField]: (newCliente[activeField] || "") + number,
      });
    }
  };

  const handleClear = () => {
    if (activeField) {
      setNewCliente({
        ...newCliente,
        [activeField]: "",
      });
    }
  };

  return (
    <div className="cliente-container">
      <h1>Gestión de Clientes</h1>

      <div className="seccion-add">
        <div className="cliente-add">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del cliente"
            value={newCliente.nombre}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="cedula"
            placeholder="Cédula"
            value={newCliente.cedula}
            onFocus={() => setActiveField("cedula")}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={newCliente.telefono}
            onFocus={() => setActiveField("telefono")}
            onChange={handleInputChange}
          />
          <button onClick={handleAddCliente}>Agregar</button>
          <ul className="cliente-list">
            {clientes.map((cliente) => (
              <li key={cliente.id} className="cliente-item">
                  <div className="cliente-name">{cliente.nombre}</div>
                  <div className="cedula">{cliente.cedula}</div>
                  <div>Ordenes: {cliente.nro_ordenes}</div>
                <button onClick={() => handleDeleteCliente(cliente.id)}>
                  <MdDelete />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Cliente;