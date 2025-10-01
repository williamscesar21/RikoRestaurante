import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Ordenes.css';
import { useNavigate } from 'react-router-dom';
import { BiChat } from 'react-icons/bi';

const Ordenes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = localStorage.getItem('restaurantId'); // ✅ usamos restaurante
  const navigate = useNavigate();

  const prioridadEstado = {
    'Pendiente': 1,
    'En preparación': 2,
    'En camino a entregar': 3,
    'Entregado': 4,
    'Cancelado': 5,
    'Rechazado': 6,
  };

  const estadoLabels = {
  "Confirmando pago": "Confirma el Pago",
  "Pendiente": "Pendiente",
  "En preparación": "Preparando",
  "En camino a recoger": "Repartidor en camino al restaurante",
  "En camino a entregar": "Pedido en camino",
  "Entregado": "Entregado",
  "Cancelado": "Cancelado",
  "Rechazado": "Rechazado",
};

  const map = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', ' ': '-' };
  const normalizarClaseEstado = (estado) =>
    estado.toLowerCase().replace(/[áéíóúÁÉÍÓÚ ]/g, (c) => map[c] || '');

  const fetchPedidos = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `https://rikoapi.onrender.com/api/pedido/pedidos/restaurante/${restaurantId}`
      );
      setPedidos(data);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/pedido/pedidos/${idPedido}/estado`,
        { estado: nuevoEstado }
      );
      fetchPedidos();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('No se pudo actualizar el pedido');
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  if (!restaurantId) return <div className="empty-text">Restaurante no autenticado</div>;
  if (loading) return <div className="loading-text">Cargando pedidos...</div>;
  if (pedidos.length === 0) return <div className="empty-text">No tienes pedidos</div>;

  return (
    <div className="ordenes-container">
      <h1>Gestión de Pedidos</h1>

      <div className="ordenes-list">
        {[...pedidos]
          .sort((a, b) => prioridadEstado[a.estado] - prioridadEstado[b.estado])
          .map((pedido) => (
            <div key={pedido._id} className="orden-card animate-in">
              {/* HEADER */}
              <div className="pedido-header">
                <span className="orden-id">#{pedido._id.slice(-6)}</span>
                
                <span className={`orden-estado estado-${normalizarClaseEstado(pedido.estado)}`}>
                 {estadoLabels[pedido.estado] || pedido.estado}
                </span>
                <p
                    className="orden-chat-button"
                    onClick={() => navigate(`/chat/${pedido._id}`)}
                  >
                    <BiChat /> Chat
                </p>
              </div>

              {/* INFO */}
              <div className="orden-body">
                <p className="orden-cliente"><strong>Cliente:</strong> {pedido.id_cliente?.nombre} {pedido.id_cliente?.apellido}</p>
                <p className="orden-total"><strong>Total:</strong> ${pedido.total.toFixed(2)}</p>
                <p className="orden-direccion">
                  <strong>Dirección: </strong>
                  <a
                    href={`https://www.google.com/maps?q=${pedido.direccion_de_entrega}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pedido.direccion_de_entrega}
                  </a>
                </p>
                <p className="orden-fecha"><strong>Fecha:</strong> {new Date(pedido.createdAt).toLocaleString()}</p>
              </div>

              {/* PRODUCTOS */}
              <div className="orden-productos">
                {pedido.detalles.map((detalle, index) => (
                  <div key={index} className="orden-producto">
                    <img
                      src={detalle.id_producto?.images?.[0] || "/default-product.png"}
                      alt={detalle.id_producto?.nombre}
                    />
                    <div>
                      <p className="producto-nombre">{detalle.id_producto?.nombre}</p>
                      <p className="producto-cantidad">x{detalle.cantidad}</p>
                      <p className="producto-subtotal">
                        ${(detalle.id_producto?.precio * detalle.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTONES */}
              <div className="orden-actions">
                {pedido.estado === 'Pendiente' && (
                  <>
                    <button className="btn-aceptar" onClick={() => cambiarEstadoPedido(pedido._id, 'En preparación')}>Aceptar</button>
                    <button className="btn-cancelar" onClick={() => cambiarEstadoPedido(pedido._id, 'Cancelado')}>Cancelar</button>
                  </>
                )}
                {pedido.estado === 'En preparación' && (
                  <button className="btn-enviar" onClick={() => cambiarEstadoPedido(pedido._id, 'En camino a entregar')}>Enviar</button>
                )}
                {pedido.estado === 'En camino a entregar' && (
                  <button className="btn-entregado" onClick={() => cambiarEstadoPedido(pedido._id, 'Entregado')}>Marcar Entregado</button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Ordenes;
