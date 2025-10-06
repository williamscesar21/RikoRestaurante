import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Clientes.css";
import { FiPhone, FiMail, FiMapPin, FiShoppingBag } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const Clientes = () => {
  const restaurantId = localStorage.getItem("restaurantId");
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // 📦 Obtener clientes
  const fetchClientes = async () => {
    try {
      const { data } = await axios.get(
        `https://rikoapi.onrender.com/api/pedido/pedidos/clientes/restaurante/${restaurantId}`
      );
      setClientes(data);
    } catch (error) {
      console.error("❌ Error al obtener clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchClientes();
  }, [restaurantId]);

  // 🔍 Filtro de búsqueda
  const clientesFiltrados = clientes.filter(
    (item) =>
      item.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cliente.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cliente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cliente.telefono.includes(busqueda)
  );

  const abrirWhatsapp = (telefono, nombre) => {
    const num = telefono.replace(/\D/g, ""); // limpia formato
    const mensaje = `Hola ${nombre}, te contactamos desde tu restaurante en Riko App 🍽️`;
    window.open(`https://wa.me/58${num}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  if (loading) return <div className="loading-text">Cargando clientes...</div>;

  return (
    <div className="clientes-container">
      <h1>Clientes del Restaurante</h1>

      {/* 🔍 Buscador */}
      <input
        type="text"
        placeholder="Buscar cliente por nombre, correo o teléfono..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="buscador-clientes"
      />

      {/* 📋 Lista */}
      <div className="clientes-grid">
        {clientesFiltrados.length === 0 ? (
          <p className="empty-text">No hay clientes registrados aún</p>
        ) : (
          clientesFiltrados.map(({ cliente, cantidad_pedidos }) => (
            <div key={cliente._id} className="cliente-card">
              <div className="cliente-header">
                <div className="avatar">{cliente.nombre[0]}</div>
                <div>
                  <h3>
                    {cliente.nombre} {cliente.apellido}
                  </h3>
                  {/* <p className="cliente-status">
                    {cliente.estatus === "Activo" ? "🟢 Activo" : "🔴 Inactivo"}
                  </p> */}
                </div>
              </div>

              <div className="cliente-info">
                <p>
                  <FiMail /> {cliente.email}
                </p>
                <p>
                  <FiPhone /> {cliente.telefono}
                </p>
                {/* <p>
                  <FiMapPin />{" "}
                  <a
                    href={`https://www.google.com/maps?q=${cliente.location}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver ubicación
                  </a>
                </p> */}
                <p className="pedidos-count">
                  <FiShoppingBag /> Pedidos:{" "}
                  <strong>{cantidad_pedidos}</strong>
                </p>
              </div>

              {/* <div className="cliente-actions">
                <button
                  className="btn-whatsapp"
                  onClick={() =>
                    abrirWhatsapp(cliente.telefono, cliente.nombre)
                  }
                >
                  <FaWhatsapp /> WhatsApp
                </button>
                <button
                  className="btn-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(cliente.email);
                    alert("📋 Correo copiado");
                  }}
                >
                  Copiar correo
                </button>
              </div> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Clientes;
