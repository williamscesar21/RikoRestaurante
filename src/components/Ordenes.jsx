import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Ordenes.css";
import { useNavigate } from "react-router-dom";
import { BiChat, BiSearch } from "react-icons/bi";
import { FaSync } from "react-icons/fa";

const Ordenes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroMontoMin, setFiltroMontoMin] = useState("");
  const [filtroMontoMax, setFiltroMontoMax] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("Todos");
  const [clientesUnicos, setClientesUnicos] = useState([]);

  const restaurantId = localStorage.getItem("restaurantId");
  const navigate = useNavigate();

  const prioridadEstado = {
    "Confirmando pago": 0,
    Pendiente: 1,
    "En preparación": 2,
    "En camino a entregar": 3,
    "Esperando confirmación del cliente": 3.5,
    Entregado: 4,
    Cancelado: 5,
    Rechazado: 6,
  };

  const estadoLabels = {
    "Confirmando pago": "Confirma el pago",
    Pendiente: "Pendiente",
    "En preparación": "Preparando",
    "En camino a entregar": "En camino",
    "Esperando confirmación del cliente": "Esperando confirmación",
    Entregado: "Entregado",
    Cancelado: "Cancelado",
    Rechazado: "Rechazado",
  };

  const estadosDisponibles = ["Todos", ...Object.keys(estadoLabels)];

  /* ==================== FETCH ==================== */
  const fetchPedidos = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `https://rikoapi.onrender.com/api/pedido/pedidos/restaurante/${restaurantId}`
      );

      // Estado intermedio
      const pedidosProcesados = data.map((p) => {
        if (
          p.estado === "En camino a entregar" &&
          p.confirmado_por_repartidor === true &&
          p.confirmado_por_cliente === false
        ) {
          return { ...p, estado: "Esperando confirmación del cliente" };
        }
        return p;
      });

      setPedidos(pedidosProcesados);

      const clientes = [
        ...new Set(
          pedidosProcesados
            .map((p) => p.id_cliente?.nombre + " " + p.id_cliente?.apellido)
            .filter(Boolean)
        ),
      ];
      setClientesUnicos(clientes);
    } catch (error) {
      console.error("❌ Error al obtener pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  /* ==================== ACCIONES ==================== */
  const aceptarPedido = async (idPedido) => {
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/pedido/pedidos/${idPedido}/aceptar`
      );
      fetchPedidos();
    } catch (error) {
      console.error("❌ Error al aceptar pedido:", error);
    }
  };

  const confirmarRecogida = async (idPedido) => {
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/pedido/pedidos/${idPedido}/recogido`
      );
      fetchPedidos();
    } catch (error) {
      console.error("❌ Error al confirmar recogida:", error);
    }
  };

  const confirmarEntrega = async (idPedido) => {
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/pedido/pedidos/${idPedido}/entregado`,
        { quien_confirma: "repartidor" }
      );
      fetchPedidos();
    } catch (error) {
      console.error("❌ Error al confirmar entrega:", error);
    }
  };

  /* ==================== FILTROS ==================== */
  const pedidosFiltrados = pedidos
    .filter((p) =>
      filtroEstado === "Todos" ? true : p.estado === filtroEstado
    )
    .filter((p) =>
      busqueda.trim() === ""
        ? true
        : p.id_cliente?.nombre
            ?.toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          p.id_cliente?.apellido
            ?.toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          p._id.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((p) =>
      filtroCliente === "Todos"
        ? true
        : `${p.id_cliente?.nombre} ${p.id_cliente?.apellido}` === filtroCliente
    )
    .filter((p) =>
      filtroFecha
        ? new Date(p.createdAt).toISOString().slice(0, 10) === filtroFecha
        : true
    )
    .filter((p) =>
      filtroMontoMin ? p.total >= parseFloat(filtroMontoMin) : true
    )
    .filter((p) =>
      filtroMontoMax ? p.total <= parseFloat(filtroMontoMax) : true
    );

  /* ==================== UI ==================== */
  if (loading)
    return (
      <div className="ordenes-container">
        <h1>Gestión de Pedidos</h1>
        <p>Cargando pedidos...</p>
      </div>
    );

  return (
    <div className="ordenes-container">
      <h1>Gestión de Pedidos</h1>

      {/* 🔍 FILTROS AVANZADOS (NO LOS TABS) */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <BiSearch />
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtro-grupo">
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
          >
            <option value="Todos">Todos los clientes</option>
            {clientesUnicos.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>

        <div className="filtro-grupo monto-range">
          <input
            type="number"
            placeholder="Monto mín"
            value={filtroMontoMin}
            onChange={(e) => setFiltroMontoMin(e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Máx"
            value={filtroMontoMax}
            onChange={(e) => setFiltroMontoMax(e.target.value)}
          />
        </div>

        <button
          className="btn-reset"
          onClick={() => {
            setBusqueda("");
            setFiltroCliente("Todos");
            setFiltroFecha("");
            setFiltroMontoMin("");
            setFiltroMontoMax("");
          }}
        >
          <FaSync /> Limpiar
        </button>
      </div>

      {/* 📌 TABS DE ESTADO (como los tenías antes) */}
      <div className="filtros-tabs">
        {estadosDisponibles.map((estado) => (
          <button
            key={estado}
            className={`filtro-btn ${filtroEstado === estado ? "activo" : ""}`}
            onClick={() => setFiltroEstado(estado)}
          >
            {estadoLabels[estado] || estado}
          </button>
        ))}
      </div>

      {/* 📦 LISTA DE PEDIDOS */}
      <div className="ordenes-list">
        {[...pedidosFiltrados]
          .sort(
            (a, b) => prioridadEstado[a.estado] - prioridadEstado[b.estado]
          )
          .map((pedido) => (
            <div key={pedido._id} className="orden-card animate-in">
              <div className="pedido-header">
                <span className="orden-id">#{pedido._id.slice(-6)}</span>
                <span
                  className={`orden-estado estado-${pedido.estado
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                >
                  {estadoLabels[pedido.estado] || pedido.estado}
                </span>
                <p
                  className="orden-chat-button"
                  onClick={() => navigate(`/chat/${pedido._id}`)}
                >
                  <BiChat /> Chat
                </p>
              </div>

              <div className="orden-body">
                <p>
                  <strong>Cliente:</strong> {pedido.id_cliente?.nombre}{" "}
                  {pedido.id_cliente?.apellido}
                </p>
                <p>
                  <strong>Total:</strong> ${pedido.total.toFixed(2)}
                </p>
                <p>
                  <strong>Dirección: </strong>
                  <a
                    href={`https://www.google.com/maps?q=${pedido.direccion_de_entrega}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pedido.direccion_de_entrega}
                  </a>
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(pedido.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="orden-productos">
                {pedido.detalles.map((detalle, index) => (
                  <div key={index} className="orden-producto">
                    <img
                      src={
                        detalle.id_producto?.images?.[0] ||
                        "/default-product.png"
                      }
                      alt={detalle.id_producto?.nombre}
                    />
                    <div>
                      <p>{detalle.id_producto?.nombre}</p>
                      <p>x{detalle.cantidad}</p>
                      <p>
                        $
                        {(
                          detalle.id_producto?.precio * detalle.cantidad
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="orden-actions">
                {pedido.estado === "Pendiente" && (
                  <button
                    className="btn-aceptar"
                    onClick={() => aceptarPedido(pedido._id)}
                  >
                    Preparar
                  </button>
                )}

                {pedido.estado === "En preparación" && (
                  <button
                    className="btn-enviar"
                    onClick={() => confirmarRecogida(pedido._id)}
                  >
                    En camino
                  </button>
                )}

                {(pedido.estado === "En camino a entregar" ||
                  pedido.estado === "Esperando confirmación del cliente") &&
                  !pedido.confirmado_por_repartidor && (
                    <button
                      className="btn-entregado"
                      onClick={() => confirmarEntrega(pedido._id)}
                    >
                      Confirmar Entregado
                    </button>
                  )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Ordenes;
