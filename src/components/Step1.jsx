import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCircle } from "react-icons/fa6";
import axios from 'axios';
import { api_base_url } from '../../../ipconfig';
import * as XLSX from 'xlsx';
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import ClienteModal from './ClienteModal';


const Step1 = ({ handleNextStep, handleOrdenCreada }) => {
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [meseros, setMeseros] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [mesa, setMesa] = useState('');
  const [meseroId, setMeseroId] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filtro, setFiltro] = useState('fecha');
  const [busquedaNumero, setBusquedaNumero] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('');
  const userRole = localStorage.getItem('rol');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesResponse, mesasResponse, meserosResponse, ordenesResponse] = await Promise.all([
          axios.get(`${api_base_url}/clientes`),
          axios.get(`${api_base_url}/mesas`),
          axios.get(`${api_base_url}/meseros`),
          axios.get(`${api_base_url}/ordenes`),
        ]);
        setClientes(clientesResponse.data);
        setMesas(mesasResponse.data); // Filtrar mesas libres
        setMeseros(meserosResponse.data);
        setOrdenes(ordenesResponse.data);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);

  const createOrden = async () => {
    try {
      // Fetch the latest open session
      const sesionesResponse = await axios.get(`${api_base_url}/sesiones`);
      const sesionesAbiertas = sesionesResponse.data.filter(sesion => sesion.estado === 'abierta');
      
      if (sesionesAbiertas.length === 0) {
        console.error("No hay sesiones abiertas.");
        alert("No hay sesiones abiertas.");
        return; // No open sessions available
      }
  
      
  
      // Create the order
      const response = await axios.post(`${api_base_url}/ordenes`, {
        cliente_id: clienteId,
        mesa,
        estado,
        mesero_id: meseroId
      });
  
      handleOrdenCreada(response.data.id);
      const ultimaSesionAbierta = sesionesAbiertas[0]; // Get the last open session
      // Update the state of the table to "ocupada"
      //await axios.put(`${api_base_url}/mesas/${mesa}`, { estado: 'ocupada' });
  
      // Add the order to the session using the latest open session ID
      await axios.post(`${api_base_url}/sesion_ordenes`, {
        sesion_id: ultimaSesionAbierta.id,
        orden_id: response.data.id
      });
  
      handleNextStep();
    } catch (error) {
      console.error("Error al crear la orden:", error);
    }
  };

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

  const ordenarYFiltrarOrdenes = () => {
    return ordenes
      .filter((orden) => {
        // Si el rol es chef, mostrar solo órdenes pendientes o en preparando
        if (userRole === 'chef' && !['pendiente', 'preparando'].includes(orden.estado)) {
          return false;
        }
  
        if (busquedaNumero && !orden.id.toString().includes(busquedaNumero)) {
          return false;
        }
        const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
        if (busquedaCliente && cliente && !cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase())) {
          return false;
        }
        
        // Filtrar por método de pago: mostrar si al menos uno coincide
        if (filtroMetodoPago && 
            !(orden.metodo_pago === filtroMetodoPago || orden.metodo_pago2 === filtroMetodoPago)) {
          return false;
        }
        
        return true;
      })
      .slice()
      .sort((a, b) => {
        if (filtro === 'fecha') {
          return new Date(b.fecha) - new Date(a.fecha);
        } else if (filtro === 'cliente') {
          const clienteA = clientes.find(cliente => cliente.id === a.cliente_id)?.nombre || '';
          const clienteB = clientes.find(cliente => cliente.id === b.cliente_id)?.nombre || '';
          return clienteA.localeCompare(clienteB);
        } else if (filtro === 'estado') {
          const ordenPrioridad = {
            'pendiente': 1,
            'preparando': 2,
            'listo': 3,
            'cancelado': 4,
            'entregado': 5
          };
          return ordenPrioridad[a.estado] - ordenPrioridad[b.estado];
        } else if (filtro === 'numero') {
          return b.id - a.id;
        }
        return 0;
      });
};

  const actualizarEstadoOrden = async (ordenId, nuevoEstado) => {
    try {
      await axios.put(`${api_base_url}/ordenes/${ordenId}`, { estado: nuevoEstado });
      // Actualizar el estado localmente
      setOrdenes(prevOrdenes => 
        prevOrdenes.map(orden => 
          orden.id === ordenId ? { ...orden, estado: nuevoEstado } : orden
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado de la orden:", error);
    }
  };

  const exportToExcel = () => {
    // Obtener las órdenes filtradas y ordenadas
    const ordenesFiltradas = ordenarYFiltrarOrdenes();
  
    // Crear un array de objetos que contenga los datos que deseas exportar
    const dataToExport = ordenesFiltradas.map(orden => {
      const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
      return {
        'Número de Orden': orden.id,
        'Estado': orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1),
        'Cliente': cliente ? `${cliente.nombre} - ${cliente.cedula}` : 'Cliente no encontrado',
        'Total': parseFloat((
          (Number(orden.total) || 0) + 
          (Number(orden.total2) || 0) - 
          (orden.total2 !== null ? (Number(orden.vuelto) || 0) : 0)
        ).toFixed(2)) || 0, // Asegurarse de que sea un número
        'Método de Pago': orden.metodo_pago ? orden.metodo_pago.charAt(0).toUpperCase() + orden.metodo_pago.slice(1) : 'Método no disponible',
        'Fecha': orden.fecha,
      };
    });
  
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
  
    // Crear la hoja de órdenes
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes');
  
    // Ajustar el ancho de las columnas automáticamente
    const columnWidths = [
      { wch: 20 }, // Ancho para 'Número de Orden'
      { wch: 15 }, // Ancho para 'Estado'
      { wch: 30 }, // Ancho para 'Cliente'
      { wch: 15 }, // Ancho para 'Total'
      { wch: 20 }, // Ancho para 'Método de Pago'
      { wch: 30 }, // Ancho para 'Fecha'
    ];
  
    worksheet['!cols'] = columnWidths;
  
    // Aplicar estilos básicos (opcional)
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFFF00" } }, // Color de fondo amarillo
      alignment: { horizontal: "center" }
    };
  
    // Aplicar estilo a la fila de encabezado
    const headers = worksheet['A1:F1'];
    if (headers) {
      for (let cell in headers) {
        if (headers[cell].v) {
          headers[cell].s = headerStyle;
        }
      }
    }
  
    // Definir el rango de la tabla
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const tableRange = `A1:F${range.e.r + 1}`; // Rango de la tabla
  
    // Agregar autofiltro
    worksheet['!autofilter'] = { ref: tableRange };
  
    // Calcular estadísticas, excluyendo órdenes con estado "cancelado"
    const ordenesValidas = ordenesFiltradas.filter(orden => orden.estado.toLowerCase() !== 'cancelado');
    const totalOrdenes = ordenesValidas.length;
    const totalIngresos = ordenesValidas.reduce((sum, orden) => {
      // Solo sumar si el método de pago no es "Crédito"
      return sum + (orden.metodo_pago !== 'credito' ? parseFloat(orden.total) || 0 : 0);
    }, 0); // Asegurarse de que sea un número
  
    const promedioIngresos = totalOrdenes > 0 ? (totalIngresos / totalOrdenes).toFixed(2) : 0;
  
    // Filtrar deudores (órdenes con método de pago "Crédito")
    const deudores = ordenesValidas.filter(orden => orden.metodo_pago === 'credito_').map(orden => {
      const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
      return {
        'Número de Orden': orden.id,
        'Cliente': cliente ? `${cliente.nombre} - ${cliente.cedula}` : 'Cliente no encontrado',
        'Total Adeudado': parseFloat(orden.total) || 0,
      };
    });
  
    // Crear una nueva hoja para el resumen financiero
    const summaryData = [
      { 'Descripción': 'Total de Órdenes', 'Valor': totalOrdenes },
      { 'Descripción': 'Total de Ingresos', 'Valor': totalIngresos.toFixed(2) },
      { 'Descripción': 'Promedio de Ingresos por Orden', 'Valor': promedioIngresos },
    ];
  
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Financiero');
  
    // Ajustar el ancho de las columnas en la hoja de resumen
    const summaryColumnWidths = [
      { wch: 40 }, // Ancho para 'Descripción'
      { wch: 20 }, // Ancho para 'Valor'
    ];
  
    summaryWorksheet['!cols'] = summaryColumnWidths;
  
    // Aplicar estilos a la hoja de resumen
    const summaryHeaderStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "00FF00" } }, // Color de fondo verde
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
  
    // Agregar sección de deudores
    const debtorData = deudores.map(deudor => ({
      'Número de Orden': deudor['Número de Orden'],
      'Cliente': deudor['Cliente'],
      'Total Adeudado': deudor['Total Adeudado'].toFixed(2),
    }));
  
    const debtorWorksheet = XLSX.utils.json_to_sheet(debtorData);
    XLSX.utils.book_append_sheet(workbook, debtorWorksheet, 'Deudores');
  
    // Ajustar el ancho de las columnas en la hoja de deudores
    const debtorColumnWidths = [
      { wch: 20 }, // Ancho para 'Número de Orden'
      { wch: 30 }, // Ancho para 'Cliente'
      { wch: 20 }, // Ancho para 'Total Adeudado'
    ];
  
    debtorWorksheet['!cols'] = debtorColumnWidths;
  
    // Aplicar estilos a la hoja de deudores
    const debtorHeaderStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FF0000" } }, // Color de fondo rojo
      alignment: { horizontal: "center" }
    };
  
    const debtorHeaders = debtorWorksheet['A1:C1'];
    if (debtorHeaders) {
      for (let cell in debtorHeaders) {
        if (debtorHeaders[cell].v) {
          debtorHeaders[cell].s = debtorHeaderStyle;
        }
      }
    }
  
    // Exportar el archivo Excel
    XLSX.writeFile(workbook, 'ordenes_con_resumen.xlsx');
};

const handleSelectCliente = (id) => {
  setClienteId(id);
};

  return (
    <>
      {(userRole === 'admin' || userRole === 'mesero') && (
        <>
        <div className="orden-add">
          <h2>Nueva Orden</h2>

          {/* Selección del Cliente */}
          <div className="form-group">
            <label 
            style={{
              cursor: 'pointer', 
              backgroundColor: 'fuchsia',
              padding: '5px 10px',
              marginBottom: '15px',
            }}
            onClick={() => setIsModalOpen(true)} htmlFor="cliente">Seleccionar Cliente</label>
            {/* <select 
              id="cliente" 
              value={clienteId} 
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Seleccionar Cliente</option>
              {clientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.cedula}
                </option>
              ))}
            </select> */}
        <p style={{margin: '15px'}}>Cliente seleccionado:</p>
        <p style={{margin: '15px', backgroundColor: 'green', padding: '5px 10px', width: 'fit-content'}}>{clienteId ? clientes.find(cliente => cliente.id === clienteId)?.nombre : 'Ninguno'}</p>
        <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientes={clientes}
        onSelect={handleSelectCliente}
      />
            <Link to="/clientes" className="add-cliente-button">
              Añadir Cliente
            </Link>
          </div>

          {/* Selección de la Mesa */}
          <div className="form-group">
            <label htmlFor="mesa">Seleccionar Mesa:</label>
            <select 
              id="mesa" 
              value={mesa} 
              onChange={(e) => setMesa(e.target.value)}
            >
              <option value="">Seleccionar Mesa</option>
              {mesas.map(mesa => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.id}
                </option>
              ))}
            </select>
          </div>

          {/* Selección del Mesero */}
          <div className="form-group">
            <label htmlFor="mesero">Seleccionar Mesero:</label>
            <select 
              id="mesero" 
              value={meseroId} 
              onChange={(e) => setMeseroId(e.target.value)}
            >
              <option value="">Seleccionar Mesero</option>
              {meseros.map(mesero => (
                <option key={mesero.id} value={mesero.id}>
                  {mesero.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón para Crear Orden */}
          <div className="form-group">
            <button onClick={createOrden} className="create-orden-button">
              Tomar Orden
            </button>
          </div>
        </div>
        <div className="ordenes-filtros">
        <label>Ordenar por:</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="fecha">Fecha</option>
          <option value="cliente">Cliente</option>
          <option value="estado">Estado</option>
          <option value="numero">Número</option>
        </select>
      </div>

      <div className="ordenes-busquedas">
        <label>Búsqueda por Número:</label>
        <input
          type="text"
          placeholder="Número de Orden"
          value={busquedaNumero}
          onChange={(e) => setBusquedaNumero(e.target.value)}
        />
        <label>Búsqueda por Cliente:</label>
        <input
          type="text"
          placeholder="Nombre del Cliente"
          value={busquedaCliente}
          onChange={(e) => setBusquedaCliente(e.target.value)}
        />
        <label>Filtrar por Método de Pago:</label>
        <select value={filtroMetodoPago} onChange={(e) => setFiltroMetodoPago(e.target.value)}>
          <option value="">Todos</option>
          <option value="efectivo">Efectivo</option>
          <option value="pago movil">Pago Móvil</option>
          <option value="credito_">Crédito</option>
          <option value="credito_pagado">Crédito Pagado</option>
          <option value="punto">Punto</option>
        </select>
        <button style={{ margin: '20px', backgroundColor: 'green', borderRadius: '0px', textAlign: 'center', justifyContent: 'center' }} onClick={exportToExcel} className="export-excel-button">
        <PiMicrosoftExcelLogoDuotone />
        Exportar registro de las ordenes a Excel
        </button>
      </div>
        </>
      )}

      <h3>Órdenes Existentes</h3>
      <ul className="ordenes-list">
        {ordenarYFiltrarOrdenes().map((orden) => {
          const cliente = clientes.find(cliente => cliente.id === orden.cliente_id);
          return (
            <li onClick={() => navigate(`/ordenes/${orden.id}`)} className="orden-item" key={orden.id}>
              <div className='orden-info'>
                <div className='orden-id'>{orden.id}</div>
                <div className='orden-estado' style={{ fontSize: '12px', backgroundColor: getEstadoColor(orden.estado) }}>{orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}</div>
              </div>
              <div className='orden-cliente'>
                {cliente ? cliente.nombre + ' - ' + cliente.cedula : 'Cliente no encontrado'}
              </div>
              <div className='orden-total'>
                {(
                  (Number(orden.total) || 0) + 
                  (Number(orden.total2) || 0) - 
                  (orden.total2 !== null ? (Number(orden.vuelto) || 0) : 0)
                ).toFixed(2)}
              </div>
              <div className='orden-metodo'>
                {orden.metodo_pago ? [
              orden.metodo_pago ? `${orden.metodo_pago.charAt(0).toUpperCase() + orden.metodo_pago.slice(1)}` : null,
              orden.metodo_pago2 ? `${orden.metodo_pago2.charAt(0).toUpperCase() + orden.metodo_pago2.slice(1)} ` : null
            ].filter(Boolean).join(', ') : 'Método no disponible'}
              </div>
              <div className='orden-fecha'>{orden.fecha}</div>
              {/* Botón para actualizar estado */}
              <div className='orden-acciones'>
                {(userRole === 'chef' || userRole === 'admin' || userRole === 'mesero') && orden.estado === 'pendiente' && (
                  <button style={{color: "black", backgroundColor:"yellow", width:"100%"}} onClick={() => actualizarEstadoOrden(orden.id, 'preparando')}>Preparar</button>
                )}
                {userRole === 'chef' && orden.estado === 'preparando' && (
                  <button style={{color: "white", backgroundColor:"green", width:"100%"}} onClick={() => actualizarEstadoOrden(orden.id, 'listo')}>Listo</button>
                )}
                {(userRole === 'admin' || userRole === 'mesero') && (
                  <>
                    {orden.estado === 'preparando' && (
                      <button style={{color: "white", backgroundColor:"green", width:"100%"}} onClick={() => actualizarEstadoOrden(orden.id, 'listo')}>Listo</button>
                    )}
                    {orden.estado === 'listo' && (
                      <button style={{color: "white", backgroundColor:"purple", width:"100%"}} onClick={() => actualizarEstadoOrden(orden.id, 'entregado')}>Entregar</button>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Step1;