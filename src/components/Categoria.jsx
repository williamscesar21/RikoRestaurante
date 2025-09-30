import React, { useState, useEffect } from "react";
import "../css/Categoria.css"; // Importar estilos CSS
import { MdDelete } from "react-icons/md";
import { api_base_url } from "../../../ipconfig";

const Categoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [newCategoria, setNewCategoria] = useState("");

  // Base URL del API
  const API_URL = `${api_base_url}/categorias`;

  // Fetch inicial para obtener las categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Error al obtener las categorías");
        }
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  // Manejar el cambio de entrada
  const handleInputChange = (e) => {
    setNewCategoria(e.target.value);
  };

  // Agregar nueva categoría (POST)
  const handleAddCategoria = async () => {
    if (newCategoria.trim() === "") return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: newCategoria }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar la categoría");
      }

      const result = await response.json();
      setCategorias([...categorias, { id: result.id, nombre: newCategoria }]);
      setNewCategoria("");
    } catch (error) {
      console.error("Error al agregar categoría:", error);
    }
  };

  // Eliminar categoría (DELETE)
  const handleDeleteCategoria = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la categoría");
      }

      setCategorias(categorias.filter((categoria) => categoria.id !== id));
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  return (
    <div className="categoria-container">
      <h1>Gestión de Categorías</h1>

      {/* Agregar categoría */}
      <div className="categoria-form">
        <input
          type="text"
          placeholder="Nueva Categoría"
          value={newCategoria}
          onChange={handleInputChange}
        />
        <button onClick={handleAddCategoria}>Agregar</button>
      </div>

      {/* Lista de categorías */}
      <ul className="categoria-list">
        {categorias.map((categoria) => (
            <li key={categoria.id} className="categoria-item">
                <span>{categoria.nombre}</span>
                <button onClick={() => handleDeleteCategoria(categoria.id)}>
                    <MdDelete />
                </button>
            </li>
        ))}
    </ul>
    </div>
  );
};

export default Categoria;
