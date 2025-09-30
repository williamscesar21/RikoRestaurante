import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { api_base_url } from '../../../ipconfig';
import ProductoModal from './ProductoModal';

const Step2 = ({ handleNextStep, handlePrevStep, ordenId }) => {
  const [productoId, setProductoId] = useState('');
  const [productoCantidad, setProductoCantidad] = useState(1);
  const [productos, setProductos] = useState([]);
  const [productosOrden, setProductosOrden] = useState([]);
  const [nota, setNota] = useState('');
  const [excedeLineas, setExcedeLineas] = useState(false);
  const [precioDolar, setPrecioDolar] = useState(0); // Nuevo estado para el precio del dólar
  const maxLineas = 10;
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  const handleNotaChange = (e) => {
    const valor = e.target.value;
    const lineas = valor.split('\n').length;

    if (lineas <= maxLineas) {
      setNota(valor);
      setExcedeLineas(false);
    } else {
      setExcedeLineas(true);
      console.log('Has excedido el límite de líneas');
    }
  };

  // Fetch para obtener el precio del dólar oficial
  useEffect(() => {
    const fetchPrecioDolar = async () => {
      try {
        const response = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial');
        setPrecioDolar(response.data.promedio); // Asignar el promedio al estado
      } catch (error) {
        console.error("Error al obtener el precio del dólar:", error);
      }
    };

    fetchPrecioDolar();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Fetch para obtener productos disponibles
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get(`${api_base_url}/productos`);
        setProductos(response.data);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    };

    fetchProductos();
  }, []);

  // Fetch para obtener productos en la orden
  useEffect(() => {
    const fetchProductosOrden = async () => {
      try {
        const response = await axios.get(`${api_base_url}/ordenes_productos/${ordenId}`);
        
        const productosOrdenConNombres = await Promise.all(response.data.map(async (item) => {
          const producto = productos.find(prod => prod.id === Number(item.producto_id));
          if (producto) {
            return {
              nombre: producto.nombre,
              cantidad: item.cantidad,
              precioTotal: item.producto_total,
              productoId: item.producto_id,
            };
          }
        }));

        setProductosOrden(productosOrdenConNombres.filter(Boolean));
      } catch (error) {
        console.error("Error al obtener los productos de la orden:", error);
      }
    };

    fetchProductosOrden();
  }, [ordenId, productos]);

  // Fetch para obtener la nota de la orden
  useEffect(() => {
    const fetchNotaOrden = async () => {
      try {
        const response = await axios.get(`${api_base_url}/ordenes/${ordenId}`);
        setNota(response.data.nota || '');
      } catch (error) {
        console.error("Error al obtener la nota de la orden:", error);
      }
    };

    fetchNotaOrden();
  }, [ordenId]);

  const addProductoToOrden = async () => {
    try {
      const productoSeleccionado = productos.find(prod => prod.id === Number(productoId));
      if (!productoSeleccionado) {
        alert("Selecciona un producto válido.");
        return;
      }

      if (!productoCantidad || productoCantidad < 1) {
        alert("La cantidad debe ser al menos 1.");
        return;
      }

      const productoTotal = (productoSeleccionado.precio_venta * productoCantidad);
      const jsonRequest = {
        orden_id: ordenId,
        producto_id: productoId,
        cantidad: productoCantidad,
        producto_precio: productoSeleccionado.precio_venta,
        orden_producto_total: productoTotal
      };

      await axios.post(`${api_base_url}/ordenes_productos`, jsonRequest);

      const nuevoProducto = {
        nombre: productoSeleccionado.nombre,
        cantidad: productoCantidad,
        precioTotal: productoTotal,
        productoId: productoSeleccionado.id,
      };

      setProductosOrden([...productosOrden, nuevoProducto]);
      setProductoId('');
      setProductoCantidad(1);
    } catch (error) {
      console.error("Error al añadir producto a la orden:", error);
    }
  };

  const deleteProductoFromOrden = async (productoId) => {
    try {
      await axios.delete(`${api_base_url}/ordenes_productos/${ordenId}/${productoId}`);
      setProductosOrden(productosOrden.filter(prod => prod.productoId !== productoId));
      console.log('Producto eliminado de la orden');
    } catch (error) {
      console.error("Error al eliminar el producto de la orden:", error);
    }
  };

  const updateProductoCantidad = async (productoId, nuevaCantidad) => {
    try {
      const cantidadNumerica = Number(nuevaCantidad);

      if (cantidadNumerica < 1) {
        alert("La cantidad debe ser al menos 1.");
        return;
      }

      const jsonRequest = {
        cantidad: cantidadNumerica
      };

      await axios.put(`${api_base_url}/ordenes_productos/${ordenId}/${productoId}`, jsonRequest);

      const productoSeleccionado = productos.find(prod => prod.id === productoId);
      const nuevoPrecioTotal = productoSeleccionado.precio_venta * cantidadNumerica;

      setProductosOrden(productosOrden.map(prod => 
        prod.productoId === productoId ? { 
          ...prod, 
          cantidad: cantidadNumerica, 
          precioTotal: nuevoPrecioTotal 
        } : prod
      ));
    } catch (error) {
      console.error("Error al actualizar la cantidad del producto:", error);
    }
  };

  const handleCancelarOrden = async () => {
    try {
      await axios.delete(`${api_base_url}/ordenes/${ordenId}`);
      handlePrevStep();
    } catch (error) {
      console.error("Error al eliminar la orden:", error);
    }
  };

  const handleUpdateOrden = async () => {
    try {
      const jsonRequest = {
        nota: nota
      };

      await axios.put(`${api_base_url}/ordenes/${ordenId}`, jsonRequest);
      console.log('Orden actualizada con la nota');
      handleNextStep();
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
    }
  };

  return (
    <div>
      <h2>Añadir Productos a la Orden</h2>
      <div className='choice-product'>
        {/* <select value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
          <option value="">Seleccionar Producto</option>
          {productos.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(producto => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} ({producto.precio_venta}$ | {(producto.precio_venta * precioDolar).toFixed(2)} Bs)
            </option>
          ))}
        </select> */}
        <button style={{ marginTop: '10px', backgroundColor: 'fuchsia', color: 'white', borderRadius: '0px' }} onClick={() => setIsModalOpen(true)}>Seleccionar Producto</button>
        <span>Producto Seleccionado: </span>
        <p style={{ marginTop: '10px', backgroundColor: 'orange', color: 'white', borderRadius: '0px', padding: '5px' }}>{productoId ? productos.find(prod => prod.id === Number(productoId))?.nombre : 'Ninguno'}</p>
        <ProductoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productos={productos}
        onSelect={(id) => setProductoId(id)} // Actualiza el productoId seleccionado
      />
        Cantidad:
        <input
          type="number"
          value={productoCantidad}
          onChange={(e) => setProductoCantidad(e.target.value)}
          min="1"
          placeholder="Cantidad"
          required
        />

        <button onClick={addProductoToOrden}>Añadir</button>
      </div>

      {/* Campo para la nota */}
      <div className='note-input'>
        <label style={{ display: 'block', marginTop: '15px' }}>Nota:</label>
        <textarea
          type="text"
          value={nota}
          onChange={handleNotaChange}
          placeholder="Escribe una nota"
          maxLength={250}
          style={{ maxHeight: '100px', overflowY: 'auto' }}
        />
        {excedeLineas && <p>Has excedido el número máximo de líneas.</p>}
      </div>

      <div>
        <h3 className='chosen-product-title'>Productos Seleccionados:</h3>
        <ul className='chosen-product-list'>
          {productosOrden.map((producto, index) => (
            <li className='chosen-product' key={index}>
              <div className='chosen-product-name'>
                <p>{producto.nombre}</p>
              </div>
              <div className='chosen-product-quantity'>
                <p>Cantidad:</p>
                <div style={{ display: 'flex', alignItems: 'center' }}> {/* Contenedor flex para alinear horizontalmente */}
                  <button 
                    className='quantity-button'
                    style={{ 
                      marginLeft: '10px', 
                      marginRight: '10px', 
                      backgroundColor: 'orange', 
                      borderRadius: '10px', 
                      width: '30px', 
                      height: '30px', 
                      display: 'flex', // Usar flexbox
                      alignItems: 'center', // Centrar verticalmente
                      justifyContent: 'center', // Centrar horizontalmente
                      fontSize: '16px', // Ajustar el tamaño de la fuente si es necesario
                      color: 'white' // Cambiar el color del texto si es necesario
                    }}
                    onClick={() => updateProductoCantidad(producto.productoId, Math.max(1, Math.floor(producto.cantidad) - 1))} // Asegúrate de que no baje de 1
                    disabled={Math.floor(producto.cantidad) <= 1} // Deshabilitar si la cantidad es 1
                  >
                    -
                  </button>
                  {/* <input
                    type="number"
                    value={Math.floor(producto.cantidad)} // Asegúrate de que sea un número entero
                    onChange={(e) => {
                      const nuevaCantidad = Math.max(1, parseInt(e.target.value, 10)); // Asegúrate de que sea al menos 1
                      updateProductoCantidad(producto.productoId, nuevaCantidad);
                    }}
                    min="1"
                    style={{ width: '50px', marginLeft: '10px', marginRight: '10px' }}
                  /> */}
                  <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginLeft: '10px',
                    marginRight: '10px',
                    backgroundColor: 'white',
                    padding: '5px 20px',
                    borderRadius: '10px',
                    color: 'black'
                  }}
                  >{Math.floor(producto.cantidad)}</p>
                  <button 
                    className='quantity-button'
                    style={{ 
                      marginLeft: '10px', 
                      marginRight: '10px', 
                      backgroundColor: 'orange', 
                      borderRadius: '10px', 
                      width: '30px', 
                      height: '30px', 
                      display: 'flex', // Usar flexbox
                      alignItems: 'center', // Centrar verticalmente
                      justifyContent: 'center', // Centrar horizontalmente
                      fontSize: '16px', // Ajustar el tamaño de la fuente si es necesario
                      color: 'white' // Cambiar el color del texto si es necesario
                    }}
                    onClick={() => updateProductoCantidad(producto.productoId, Math.floor(producto.cantidad) + 1)} // Asegúrate de que sea un número entero
                  >
                    +
                  </button>
                </div>                            
              </div>
              <div className='chosen-product-price'>
                <p style={{fontSize: '15px'}}>Total: {producto.precioTotal} ($) | {(producto.precioTotal * precioDolar).toFixed(2)} (Bs)</p>
              </div>
              <div className='chosen-product-buttons'>
                <div className='chosen-delete' onClick={() => deleteProductoFromOrden(producto.productoId)}>
                  <MdDelete />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className='step-buttons'>
        <button onClick={handleCancelarOrden}>Cancelar</button>
        <button 
          style={{ backgroundColor: productosOrden.length === 0 ? 'gray' : '' }} 
          onClick={handleUpdateOrden} 
          disabled={productosOrden.length === 0}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Step2;