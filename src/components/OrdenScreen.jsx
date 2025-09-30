import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import '../css/OrdenScreen.css';
import { IoMdCloseCircle } from "react-icons/io";
import { api_base_url } from '../../../ipconfig';
import { MdEdit } from "react-icons/md";
import { RiSave3Fill } from "react-icons/ri";


const OrdenScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [ordenInfo, setOrdenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [productos, setProductos] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [editMode, setEditMode] = useState(false); // Estado para el modo de edición
  const [formData, setFormData] = useState({}); // Estado para los datos del formulario
  const [mesas, setMesas] = useState([]);
  const userRole = localStorage.getItem('rol');

  const RIF_EMPRESA = "J-12345678-9";

  const [excedeLineas, setExcedeLineas] = useState(false);
    const maxLineas = 10; // Número máximo de líneas permitidas
  
    const handleNotaChange = (e) => {
      const valor = e.target.value;
      const lineas = valor.split('\n').length;
  
      if (lineas <= maxLineas) {
        setNota(valor);
        setExcedeLineas(false);
      } else {
        setExcedeLineas(true);
        // Puedes mostrar un mensaje de alerta aquí
        console.log('Has excedido el límite de líneas');
      }
    };

  useEffect(() => {
    const fetchOrdenInfo = async () => {
      try {
        const [ordenResponse, mesasResponse] = await Promise.all([
          axios.get(`${api_base_url}/ordenes/${orderId}`),
          axios.get(`${api_base_url}/mesas`),
        ]);
  
        setOrdenInfo(ordenResponse.data);
        setFormData(ordenResponse.data); // Inicializar formData con la información de la orden
        setMesas(mesasResponse.data);
      } catch (error) {
        console.error('Error al obtener la información de la orden o de las mesas:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrdenInfo();
  }, [orderId]);

  useEffect(() => {
    const fetchClienteInfo = async () => {
      if (ordenInfo && ordenInfo.cliente_id) {
        try {
          const response = await axios.get(`${api_base_url}/clientes/${ordenInfo.cliente_id}`);
          setClienteInfo(response.data);
        } catch (error) {
          console.error('Error al obtener la información del cliente:', error);
        }
      }
    };

    fetchClienteInfo();
  }, [ordenInfo]);

  useEffect(() => {
    const fetchTodosLosProductos = async () => {
      try {
        const response = await axios.get(`${api_base_url}/productos`);
        setTodosLosProductos(response.data);
      } catch (error) {
        console.error('Error al obtener la lista de productos:', error);
      }
    };

    fetchTodosLosProductos();
  }, []);

  useEffect(() => {
    if (ordenInfo) {
      // Construir la URL de forma dinámica
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const url = `${baseUrl}/ordenes/${orderId}`;
      
      QRCode.toDataURL(url, { errorCorrectionLevel: 'H' })
        .then(url => setQrCode(url))
        .catch(err => console.error('Error al generar QR Code:', err));
    }
  }, [ordenInfo]);

  useEffect(() => {
    const fetchProductos = async () => {
      if (ordenInfo) {
        try {
          const response = await axios.get(`${api_base_url}/ordenes_productos/${orderId}`);
          const productosOrden = response.data;

          const productosConNombres = await Promise.all(productosOrden.map(async (producto) => {
            const productoEncontrado = todosLosProductos.find(p => p.id === producto.producto_id);
            return {
              ...producto,
              nombre: productoEncontrado ? productoEncontrado.nombre : 'Desconocido'
            };
          }));

          setProductos(productosConNombres);
        } catch (error) {
          console.error('Error al obtener la lista de productos:', error);
        }
      }
    };

    fetchProductos();
  }, [ordenInfo, todosLosProductos]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateOrden = async () => {
    try {
      await axios.put(`${api_base_url}/ordenes/${orderId }`, formData);
      setOrdenInfo({ ...ordenInfo, ...formData }); // Actualizar el estado de ordenInfo con los nuevos datos
      setEditMode(false); // Salir del modo de edición
    } catch (error) {
      console.error('Error al actualizar la orden:', error);
    }
  };

  const handlePrint = async () => {
    if (!ordenInfo || !clienteInfo || productos.length === 0) return;

    try {
      const doc = new jsPDF();
      const startY = 134;
      let currentY = startY;

      doc.setFillColor(230, 230, 250);
      doc.setFontSize(18);
      doc.setTextColor(50, 50, 150);
      doc.text("Factura de Daie, ¡Date un gusto!", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Fecha: ${new Date(new Date(ordenInfo.fecha).setHours(new Date(ordenInfo.fecha).getHours() + 4)).toLocaleString()}`, 14, 41);

      currentY = 50;
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 150);
      doc.text("Información del Cliente", 14, currentY);

      doc.setFontSize(12);
      doc.setTextColor(0);
      currentY += 7;
      doc.text(`ID: ${clienteInfo?.cedula || "No disponible"}`, 14, currentY);
      currentY += 6;
      doc.text(`Nombre: ${clienteInfo?.nombre || "No disponible"}`, 14, currentY);

      currentY += 10;
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 150);
      doc.text("Información de la Orden", 14, currentY);

      doc.setFontSize(12);
      doc.setTextColor(0);
      currentY += 7;
      doc.text(`ID de Orden: 000${ordenInfo.id}`, 14, currentY);
      currentY += 6;
      doc.text(`Mesa: ${ordenInfo.mesa}`, 14, currentY);
      currentY += 6;
      doc.text(`Método de Pago: ${[
        ordenInfo.metodo_pago ? `${ordenInfo.metodo_pago.charAt(0).toUpperCase() + ordenInfo.metodo_pago.slice(1)} (${ordenInfo.total})` : null,
        ordenInfo.metodo_pago2 ? `${ordenInfo.metodo_pago2.charAt(0).toUpperCase() + ordenInfo.metodo_pago2.slice(1)} (${ordenInfo.total2})` : null
      ].filter(Boolean).join(', ')}`, 14, currentY);
      currentY += 6;
      doc.text(`Total: ${(
        (Number(ordenInfo.total) || 0) + 
        (Number(ordenInfo.total2) || 0) - 
        (ordenInfo.total2 !== null ? (Number(ordenInfo.vuelto) || 0) : 0)
      ).toFixed(2)} $`, 14, currentY);
      currentY += 6;
      doc.text(`Vuelto: ${ordenInfo.vuelto || 0} $`, 14, currentY);

      currentY += 10;
      doc.line(14, currentY, 196, currentY);

      currentY += 5;
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 150);
      doc.text("Productos de la Orden", 14, currentY);

      currentY += 7;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);

      doc.text("Producto", 14, currentY);
      doc.text("Cantidad", 80, currentY);
      doc.text("Precio", 120, currentY);
      doc.text("Subtotal", 160, currentY);

      currentY += 2;
      doc.line(14, currentY, 196, currentY);

      currentY += 4;

      let totalGeneral = 0;
      productos.forEach((producto) => {
        doc.text(producto.nombre, 14, currentY);
        doc.text(`${producto.cantidad}`, 80, currentY, null, null, "right");
        doc.text(`${producto.producto_precio} $`, 120, currentY, null, null, "right");
        const subtotal = producto.cantidad * producto.producto_precio;
        doc.text(`${subtotal.toFixed(2)} $`, 160, currentY, null, null, "right");
        totalGeneral += subtotal;
        currentY += 6;

        doc.line(14, currentY - 4, 196, currentY - 4);
      });

      currentY += 10;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`Total General: ${totalGeneral.toFixed(2)} $`, 14, currentY);

      currentY += 20;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 150);
      doc.text("Gracias por su preferencia.", 105, currentY, null, null, "center");
      doc.text("Esta factura cumple con los requisitos legales.", 105, currentY + 6, null, null, "center");

      doc.save(`Factura_Orden_${ordenInfo.id}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  if (loading || !ordenInfo) {
    return <div className="loading">Cargando detalles de la orden...</div>;
  }

  return (
    <div className="orden-screen-container">
      <div className="orden-header">
        <h1 style={{textAlign: 'left'}} className="orden-screen-title">Detalles de la Orden #{ordenInfo.id}</h1>
        <div className="btn-close" onClick={() => navigate(-1)}><IoMdCloseCircle size={30} /></div> 
      </div>
      <div className="orden-details">
        <h2>Información del Cliente</h2>
        <div className="orden-info-card">
          <p><strong></strong> {clienteInfo?.nombre || "No disponible"}</p>
          <p><strong>ID:</strong> {clienteInfo?.cedula || "No disponible"}</p>
        </div>
        <h2>Información de la Orden</h2>
        <div className="orden-info-card">
          <div className='orden-info-card-lines'>
            <p><strong>Estado:</strong> {editMode ? <select className='select-edit' name="estado" value={formData.estado} onChange={handleEditChange}> 
            <option value="">Seleccionar Método de Pago</option>
              <option className='option-edit' value="pendiente">Pendiente</option>
              <option className='option-edit' value="preparando">Preparando</option>
              <option className='option-edit' value="listo">Listo</option>
              <option className='option-edit' value="entregado">Entregado</option>
              <option className='option-edit' value="cancelado">Cancelado</option>
            </select> : (ordenInfo.estado)}</p>
            <p><strong>Mesa: <br /></strong> {editMode ? <select className='select-edit' name="mesa" value={formData.mesa} onChange={handleEditChange}>
            <option className='option-edit' value="">Seleccionar Mesa</option>
              {mesas.map(mesa => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.id}
                </option>
              ))}
            </select>
             : ordenInfo.mesa}</p>
            <p><strong>Método de Pago: <br /></strong> {
            editMode ? <>
            <select className='select-edit' name="metodo_pago" value={formData.metodo_pago } onChange={handleEditChange}> 
              <option value="">Seleccionar Método de Pago</option>
              <option className='option-edit' value="efectivo">Efectivo</option>
              <option className='option-edit' value="pago movil">Pago Móvil</option>
              <option className='option-edit' value="credito_">Crédito</option>
              <option className='option-edit' value="credito_pagado">Crédito Pagado</option>
              <option className='option-edit' value="punto">Punto de Venta</option>
            </select>
            <input
            style={{
              width: "fit-content"
            }} 
            className='input-edit' type="number" name="total" value={formData.total || 0} onChange={handleEditChange} />
            <select className='select-edit' name="metodo_pago2" value={formData.metodo_pago2 } onChange={handleEditChange}> 
              <option value="">Seleccionar Método de Pago 2</option>
              <option className='option-edit' value="efectivo">Efectivo</option>
              <option className='option-edit' value="pago movil">Pago Móvil</option>
              <option className='option-edit' value="credito_">Crédito</option>
              <option className='option-edit' value="credito_pagado">Crédito Pagado</option>
              <option className='option-edit' value="punto">Punto de Venta</option>
            </select>
            <input
            style={{
              width: "fit-content"
            }} 
            className='input-edit' type="number" name="total2" value={formData.total2 || 0} onChange={handleEditChange} />
            </> : 
            [
              ordenInfo.metodo_pago ? `${ordenInfo.metodo_pago.charAt(0).toUpperCase() + ordenInfo.metodo_pago.slice(1)} (${ordenInfo.total})` : null,
              ordenInfo.metodo_pago2 ? `${ordenInfo.metodo_pago2.charAt(0).toUpperCase() + ordenInfo.metodo_pago2.slice(1)} (${ordenInfo.total2})` : null
            ].filter(Boolean).join(', ')}</p>
            <p><strong>Total: <br /></strong> {(
                  (Number(ordenInfo.total) || 0) + 
                  (Number(ordenInfo.total2) || 0) - 
                  (ordenInfo.total2 !== null ? (Number(ordenInfo.vuelto) || 0) : 0)
                ).toFixed(2)} </p>
            <p><strong>Vuelto: <br /></strong> {
            // editMode ? <input className='input-edit' type="number" name="vuelto" value={formData.vuelto || 0} onChange={handleEditChange} /> : 
            ordenInfo.vuelto || 0} </p>
            <p style={{
              backgroundColor: 'yellow', 
              color: 'black', 
              padding: '0px 5px', 
              maxWidth: '250px',
              whiteSpace: 'pre-line'
            }}>
              <strong>Nota:</strong> <br />{editMode ? <textarea className='textarea-edit' name="nota" value={formData.nota} onChange={handleEditChange} /> : ordenInfo.nota}
            </p>
            <p><strong>Fecha:</strong> {new Date(new Date(ordenInfo.fecha).setHours(new Date(ordenInfo.fecha).getHours() + 4)).toLocaleString()}</p>
          </div>
          <ul>
            <h3 className='orden-screen-h3'>Productos de la orden:</h3>
            {productos.map((producto, index) => (
              <li style={{ color: 'black', padding: '5px' }} key={index}>
                {producto.nombre} | Unidad: {producto.producto_precio}   (Cant.: {Math.floor(producto.cantidad)})
              </li>
            ))}
          </ul>
          {qrCode && <div className="qr-code-display">
            <img className='qr-code' src={qrCode} alt="Código QR" />
          </div>}
        </div>
      </div>
      {userRole === 'admin' ?<button
        style={{backgroundColor: 'blue', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', width: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px', alignSelf: 'center'}}  
        onClick={editMode ? handleUpdateOrden : () => setEditMode(true)} className="btn-edit">
        {editMode ? (
          <>
          <RiSave3Fill />{' '}
          <span>Guardar cambios</span>
          </>
          
        ) : (
          <>
            <MdEdit />{' '}
            Editar Información de la Orden
          </>
        )}
          </button>: null}
      
      <button className="btn-print" onClick={handlePrint}>Generar Factura PDF</button>
    </div>
  );
};

export default OrdenScreen;