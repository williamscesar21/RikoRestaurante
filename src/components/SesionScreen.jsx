import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/SesionScreen.css";
import { useNavigate } from "react-router-dom";
import { IoMdCloseCircle } from "react-icons/io";
import { api_base_url } from "../../../ipconfig";
import * as XLSX from 'xlsx'; // Importar la biblioteca XLSX
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";

const SesionScreen = () => {
  const { id } = useParams();
  const [sesion, setSesion] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSesionData = async () => {
      try {
        const sesionResponse = await fetch(`${api_base_url}/sesiones/${id}`);
        if (!sesionResponse.ok) throw new Error("No se pudo cargar la sesión.");

        const sesionData = await sesionResponse.json();
        setSesion(sesionData);

        // Obtener las órdenes de la sesión
        const ordenesResponse = await fetch(`${api_base_url}/sesion_ordenes/${id}`);
        if (!ordenesResponse.ok) throw new Error("No se pudieron cargar las órdenes de la sesión.");

        const ordenesData = await ordenesResponse.json();

        // Obtener todas las órdenes
        const todasLasOrdenesResponse = await fetch(`${api_base_url}/ordenes`);
        if (!todasLasOrdenesResponse.ok) throw new Error("No se pudieron cargar todas las órdenes.");

        const todasLasOrdenesData = await todasLasOrdenesResponse.json();

        // Filtrar las órdenes por la fecha de la sesión
        const fechaSesion = new Date(sesionData.fecha).toISOString().split('T')[0]; // Obtener solo la fecha (YYYY-MM-DD)
        const ordenesFiltradas = todasLasOrdenesData.filter(orden => {
          const fechaOrden = new Date(orden.fecha).toISOString().split('T')[0];
          return fechaOrden === fechaSesion;
        });

        // Combinar las órdenes de la sesión y las filtradas
        const combinedOrdenes = [...ordenesData, ...ordenesFiltradas];

        const clientesResponse = await fetch(`${api_base_url}/clientes`);
        if (!clientesResponse.ok) throw new Error("No se pudieron cargar los clientes.");

        const clientesData = await clientesResponse.json();
        setClientes(clientesData);

        const detailedOrdenes = await Promise.all(
          combinedOrdenes.map(async (orden) => {
            if (!orden.id) {
              console.warn(`Orden sin ID: ${JSON.stringify(orden)}`);
              return null; // O puedes manejarlo de otra manera
            }
            
            const ordenResponse = await fetch(`${api_base_url}/ordenes/${orden.id}`);
            if (!ordenResponse.ok) throw new Error(`Error al cargar la orden ${orden.id}`);
            return await ordenResponse.json();
          })
        );
        
        // Filtrar las órdenes que no se pudieron cargar
        const validDetailedOrdenes = detailedOrdenes.filter(orden => orden !== null);
        setOrdenes(validDetailedOrdenes);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSesionData();
  }, [id]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!sesion) {
    return <div className="loading-message">Cargando sesión...</div>;
  }

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

  // Filtrar órdenes con total no nulo
  const validOrdenes = ordenes.filter(orden => orden.total !== null);

  // Calcular el total de las órdenes y el promedio
  const totalOrdenes = validOrdenes.reduce((total, orden) => total + parseFloat(orden.total), 0);
  const promedioOrdenes = validOrdenes.length ? totalOrdenes / validOrdenes.length : 0;

  // Contar órdenes por estado
  const estados = validOrdenes.reduce((acc, orden) => {
    acc[orden.estado] = acc[orden.estado] ? acc[orden.estado] + 1 : 1;
    return acc;
  }, {});

  // Función para exportar a Excel
  const exportToExcel = () => {
    const dataToExport = validOrdenes.map(orden => {
      const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
      return {
        'Número de Orden': orden.id,
        'Estado': orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1),
        'Cliente': cliente ? `${cliente.nombre} - ${cliente.cedula}` : 'Cliente no encontrado',
        'Total': parseFloat((
          (Number(orden.total) || 0) + 
          (Number(orden.total2) || 0) - 
          (orden.total2 !== null ? (Number(orden.vuelto) || 0) : 0)
        ).toFixed(2)) || 0,
        'Método de Pago': orden.metodo_pago ? orden.metodo_pago.charAt(0).toUpperCase() + orden.metodo_pago.slice(1) : 'Método no disponible',
        'Fecha': orden.fecha ? new Date(orden.fecha).toLocaleString() : 'No disponible',
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes');

    const columnWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
    ];

    worksheet['!cols'] = columnWidths;

    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center" }
    };

    const headers = worksheet['A1:F1'];
    if (headers) {
      for (let cell in headers) {
        if (headers[cell].v) {
          headers[cell].s = headerStyle;
        }
      }
    }

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const tableRange = `A1:F${range.e.r + 1}`;
    worksheet['!autofilter'] = { ref: tableRange };

    const totalOrdenesCount = dataToExport.length;
    const totalIngresos = dataToExport.reduce((sum, orden) => {
      return sum + (orden['Método de Pago'] !== 'Crédito' ? parseFloat(orden.Total) || 0 : 0);
    }, 0);

    const promedioIngresos = totalOrdenesCount > 0 ? (totalIngresos / totalOrdenesCount).toFixed(2) : 0;

    const summaryData = [
      { 'Descripción': 'Total de Órdenes', 'Valor': totalOrdenesCount },
      { 'Descripción': 'Total de Ingresos', 'Valor': totalIngresos.toFixed(2) },
      { 'Descripción': 'Promedio de Ingresos por Orden', 'Valor': promedioIngresos },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Financiero');

    const summaryColumnWidths = [
      { wch: 40 },
      { wch: 20 },
    ];

    summaryWorksheet['!cols'] = summaryColumnWidths;

    const summaryHeaderStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "00FF00" } },
      alignment: { horizontal: "center" }
    };

    const summaryHeaders = summaryWorksheet['A1:B1'];
    if (summaryHeaders) {
      for (let cell in summaryHeaders) {
        if (summaryHeaders[cell].v) {
          summaryHeaders[cell].s = summaryHeaderStyle;
        }
      }
    }

    XLSX.writeFile(workbook, `Ordenes de la Sesión ${id}.xlsx`);
  };

  return (
    <div className="sesion-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Detalles de la Sesión</h1>
        <div style={{ textAlign: 'right' }} className="btn-close" onClick={() => navigate(-1)}><IoMdCloseCircle size={30} /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#2c2c2c', padding: '20px', borderRadius: '10px' }}>
        <div className="reporte-economico">
          <h3 style={{ margin: '0px' }}>Reporte Económico</h3>
          <p><strong>Total de las órdenes:</strong> {totalOrdenes.toFixed(2)} </p>
          <p ><strong>Promedio de las órdenes:</strong> {promedioOrdenes.toFixed(2)} </p>

          <h4>Órdenes por Estado:</h4>
          <ul>
            {Object.keys(estados).map((estado) => (
              <li key={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}: {estados[estado]}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'right' }} className="sesion-details">
          <p><strong>ID:</strong> {sesion.id}</p>
          <p><strong>Estado:</strong> {sesion.estado}</p>
          <p>
            <strong>Fecha:</strong>{" "}
            {sesion.fecha ? new Date(sesion.fecha).toLocaleDateString("es-ES") : "Fecha no disponible"}
          </p>
        </div>
      </div>

      <button onClick={exportToExcel} style={{ margin: '20px', backgroundColor: 'green', borderRadius: '0px', textAlign: 'center', justifyContent: 'center' }}>
        <PiMicrosoftExcelLogoDuotone /> Exportar a Excel
      </button>

      <h2 style={{ marginTop: '20px' }}>Órdenes de la Sesión</h2>
      {validOrdenes.length > 0 ? (
        <ul className="ordenes-list">
          {validOrdenes.map((orden) => {
            const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
            return (
              <li onClick={() => navigate(`/ordenes/${orden.id}`)} style={{ backgroundColor: '#2c2c2c' }} className="orden-item" key={orden.id}>
                <div className='orden-info'>
                  <div className='orden-id'>{orden.id}</div>
                  <div className='orden-estado' style={{ fontSize: '12px', backgroundColor: getEstadoColor(orden.estado) }}>
                    {orden.estado}
                  </div>
                </div>
                <div className='orden-cliente'>
                  {cliente ? `${cliente.nombre} - ${cliente.cedula}` : 'Cliente no encontrado'}
                </div>
                <div className='orden-total'>
                {(
                  (Number(orden.total) || 0) + 
                  (Number(orden.total2) || 0) - 
                  (orden.total2 !== null ? (Number(orden.vuelto) || 0) : 0)
                ).toFixed(2)}
                </div>
                <div className='orden-fecha'>{orden.fecha ? orden.fecha : "No disponible"}</div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No hay órdenes disponibles para esta sesión.</p>
      )}
    </div>
  );
};

export default SesionScreen;