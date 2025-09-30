import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api_base_url } from '../../../ipconfig';

const Step3 = ({ handlePrevStep, handleReset, ordenId }) => {
  const [metodoPago1, setMetodoPago1] = useState('');
  const [montoPago1, setMontoPago1] = useState(0);
  const [referenciaPago1, setReferenciaPago1] = useState('');

  const [modoMixto, setModoMixto] = useState(false);
  const [metodoPago2, setMetodoPago2] = useState('');
  const [montoPago2, setMontoPago2] = useState(0);
  const [referenciaPago2, setReferenciaPago2] = useState('');

  const [totalOrden, setTotalOrden] = useState(0);
  const [precioDolar, setPrecioDolar] = useState(0);

  useEffect(() => {
    const fetchPrecioDolar = async () => {
      try {
        const response = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial');
        setPrecioDolar(response.data.promedio);
      } catch (error) {
        console.error("Error al obtener el precio del dólar:", error);
      }
    };
    fetchPrecioDolar();
  }, []);

  useEffect(() => {
    const fetchTotalFromOrders = async () => {
      try {
        const response = await axios.get(`${api_base_url}/ordenes_productos/${ordenId}`);
        const productos = response.data;
        const total = productos.reduce((total, producto) => total + parseFloat(producto.producto_total), 0);
        setTotalOrden(total);
      } catch (error) {
        console.error("Error al obtener el total de la orden:", error);
      }
    };
    fetchTotalFromOrders();
  }, [ordenId]);

  const calcularVuelto = () => {
    const totalRecibido = montoPago1 + (modoMixto ? montoPago2 : 0);
    return totalRecibido >= totalOrden ? totalRecibido - totalOrden : 0;
  };

  const finalizarOrden = async () => {
    try {
      const vuelto = calcularVuelto();
      await axios.put(`${api_base_url}/ordenes/${ordenId}`, {
        total: montoPago1,
        total2: modoMixto ? montoPago2 : null,
        metodo_pago: metodoPago1,
        metodo_pago2: modoMixto ? metodoPago2 : null,
        referencia_pago: metodoPago1 === 'pago movil' || metodoPago1 === 'punto' ? referenciaPago1 : null,
        referencia_pago2: modoMixto && (metodoPago2 === 'pago movil' || metodoPago2 === 'punto') ? referenciaPago2 : null,
        vuelto
      });
      alert('Orden finalizada con éxito');
      handleReset();
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
    }
  };

  const isFinalizarDisabled = () => {
    const totalRecibido = montoPago1 + (modoMixto ? montoPago2 : 0);
    
    // Si el método de pago es 'credito_' y no está en modo mixto, no se requiere monto
    if (metodoPago1 === 'credito_' && !modoMixto) {
        return false; // Permitir finalizar
    }

    // Verificaciones existentes
    if (!metodoPago1 || montoPago1 <= 0) return true;
    if (modoMixto && (!metodoPago2 || montoPago2 <= 0)) return true;
    if ((metodoPago1 === 'pago movil' || metodoPago1 === 'punto') && !referenciaPago1.trim()) return true;
    if (modoMixto && (metodoPago2 === 'pago movil' || metodoPago2 === 'punto') && !referenciaPago2.trim()) return true;
    if (totalRecibido < totalOrden) return true;

    return false;
 };

  const handleMetodoPago1Change = (e) => {
    const selectedMetodo = e.target.value;
    setMetodoPago1(selectedMetodo);
    
    // Si se selecciona 'credito_' y no está en modo mixto, establecer montoPago1 igual a totalOrden
    if (selectedMetodo === 'credito_' && !modoMixto) {
      setMontoPago1(totalOrden);
    } else {
      setMontoPago1(0); // Reiniciar monto si se selecciona otro método
    }
  };

  return (
    <div>
      <h2>Finalizar Orden</h2>
      <p style={{ marginTop: '10px', backgroundColor: 'green', color: 'white', width: '100%', textAlign: 'center', padding: '10px', marginBottom: '10px' }}>
        Monto a recibir: {totalOrden} $ | { (totalOrden * precioDolar).toFixed(2) } Bs
      </p>

      <p style={{ textAlign: 'center', color: calcularVuelto() > 0 ? 'green' : 'red' }}>
        Vuelto a entregar: {calcularVuelto().toFixed(2)} $ | {(calcularVuelto() * precioDolar).toFixed(2)} Bs
      </p>

      <p style={{backgroundColor: 'blue', padding: '5px', margin: '10px', width: 'fit-content'}}>Método de Pago 1:</p>
      <select value={metodoPago1} onChange={handleMetodoPago1Change}>
        <option value="">Seleccionar Método de Pago</option>
        <option value="efectivo">Efectivo</option>
        <option value="pago movil">Pago Móvil</option>
        <option value="credito_">Crédito</option>
        <option value="punto">Punto de Venta</option>
      </select>

      {!(metodoPago1 === 'credito_' && !modoMixto) && (
        <input type="number" value={montoPago1} onChange={(e) => setMontoPago1(Number(e.target.value))} placeholder="Monto Entregado" />
      )}

      {(metodoPago1 === 'pago movil' || metodoPago1 === 'punto') && (
        <input type="text" placeholder="Referencia de Pago" value={referenciaPago1} onChange={(e) => setReferenciaPago1(e.target.value)} />
      )}

      {modoMixto && (
        <div>
          <p style={{backgroundColor: 'purple', padding: '5px', margin: '10px', width: 'fit-content'}}>Método de Pago 2:</p>
          <select value={metodoPago2} onChange={(e) => setMetodoPago2(e.target.value)}>
            <option value="">Seleccionar Método de Pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="pago movil">Pago Móvil</option>
            <option value="credito_">Crédito</option>
            <option value="punto">Punto de Venta</option>
          </select>

          {!(metodoPago2 === 'credito_' && modoMixto) && (
            <input type="number" value={montoPago2} onChange={(e) => setMontoPago2(Number(e.target.value))} placeholder="Monto Entregado" />
          )}

          {(metodoPago2 === 'pago movil' || metodoPago2 === 'punto') && (
            <input type="text" placeholder="Referencia de Pago" value={referenciaPago2} onChange={(e) => setReferenciaPago2(e.target.value)} />
          )}
        </div>
      )}

      <button onClick={() => setModoMixto(!modoMixto)} style={{ marginTop: '10px' }}>
        {modoMixto ? 'Desactivar Pago Mixto' : 'Activar Pago Mixto'}
      </button>

      <div className='step-buttons'>
        <button onClick={handlePrevStep}>Anterior</button>
        <button style={{ backgroundColor: isFinalizarDisabled() ? 'gray' : '' }} onClick={finalizarOrden} disabled={isFinalizarDisabled()}>
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default Step3;