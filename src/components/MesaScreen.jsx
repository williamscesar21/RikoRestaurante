import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';
import '../css/MesaScreen.css';
import { IoMdCloseCircle } from "react-icons/io";
import { api_base_url } from '../../../ipconfig';

const MesaScreen = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const [mesaInfo, setMesaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]); // Estado para almacenar los clientes

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#ff5f4f';
      case 'preparando':
        return '#4facff';
      case 'listo':
        return '#5cff4f';
      case 'entregado':
        return '#af4fff';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    const fetchMesaInfo = async () => {
      try {
        const response = await axios.get(`${api_base_url}/mesas/${mesaId}`);
        setMesaInfo(response.data);
      } catch (error) {
        console.error('Error al obtener la información de la mesa:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrdenesByMesa = async () => {
      try {
        const response = await axios.get(`${api_base_url}/ordenes/mesa/${mesaId}`);
        // Filtrar las órdenes que están en estado "pendiente"
        const ordenesPendientes = response.data.filter(orden => orden.estado === "pendiente");
        setOrdenes(ordenesPendientes); // Almacenar solo las órdenes pendientes
      } catch (error) {
        console.error('Error al obtener las órdenes de la mesa:', error);
      }
    };

    const fetchClientes = async () => {
      try {
        const response = await axios.get(`${api_base_url}/clientes`);
        setClientes(response.data); // Almacenar la lista de clientes
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
      }
    };

    fetchMesaInfo();
    fetchOrdenesByMesa();
    fetchClientes(); // Llamar a la función para obtener los clientes
  }, [mesaId]);

  useEffect(() => {
    if (mesaInfo) {
      const url = `${api_base_url}/mesas/${mesaId}`;
      QRCode.toDataURL(url, { errorCorrectionLevel: 'H' })
        .then(url => setQrCode(url))
        .catch(err => console.error('Error al generar QR Code:', err));
    }
  }, [mesaInfo]);

  if (loading || !mesaInfo) {
    return <div className="loading">Cargando detalles de la mesa...</div>;
  }

  return (
    <div className="mesa-screen-container">
      <div className="mesa-header">
        <h1 className="mesa-screen-title">Detalles de la Mesa #{mesaInfo.numero}</h1>
        <div className="btn-close" onClick={() => navigate('/mesas')}><IoMdCloseCircle size={30} /></div> 
      </div>
      <div className="mesa-details">
        <h2>Información de la Mesa</h2>
        <div className="mesa-info-card">
            <div className='mesa-info-details'>
          <p><strong>Número:</strong> {mesaInfo.numero}</p>
          <p><strong>Capacidad:</strong> {mesaInfo.capacidad}</p>
          <p><strong>Estado:</strong> {mesaInfo.estado}</p></div>
          {qrCode && <div className="qr-code-display">
          <img src={qrCode} alt="Código QR" />
        </div>}
        </div>
        
      </div>
      <div className="ordenes-section">
        <h2>Órdenes Pendientes</h2>
        {ordenes.length > 0 ? (
          <ul className="ordenes-list">
            {ordenes.map(orden => {
              // Buscar el cliente correspondiente a la orden
              const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
              return (
                <li style={{ backgroundColor: '#222222' }} className="orden-item" key={orden.id}>
                  <div className='orden-info'>
                    <div className='orden-id'>{orden.id}</div>
                    <div className='orden-estado' style={{ fontSize: '12px', backgroundColor: getEstadoColor(orden.estado) }}>
                      {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                    </div>
                  </div>
                  <div className='orden-cliente'>
                    {cliente ? `${cliente.nombre} - ${cliente.cedula}` : 'Cliente no encontrado'}
                  </div>
                  <div className='orden-total'>
                    {orden.total}
                  </div>
                  <div className='orden-fecha'>{orden.fecha}</div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No hay órdenes pendientes para esta mesa.</p>
        )}
      </div>
    </div>
  );
};

export default MesaScreen;