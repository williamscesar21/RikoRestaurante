import React, { useState } from 'react';
import '../css/ProductoModal.css'; // Asegúrate de crear este archivo CSS

const ProductoModal = ({ isOpen, onClose, productos, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setSearchTerm(''); // Limpiar el input al cerrar
      onClose();
    }
  };

  const handleClose = () => {
    setSearchTerm(''); // Limpiar el input al cerrar
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>Seleccionar Producto</h2>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredProductos.map(producto => (
            <li
            style={{
              backgroundColor: producto.available ? '' : 'red',
              borderBottomColor: producto.available ? '' : 'red',
              cursor: producto.available ? 'pointer' : 'not-allowed',
            }}
            key={producto.id}
            onClick={() => {
              if (producto.available) {
                onSelect(producto.id);
                handleClose(); // Limpiar el input al seleccionar
              }
            }}
          >
            {producto.nombre} - Precio: {producto.precio_venta}$
          </li>
          ))}
        </ul>
        <button onClick={handleClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ProductoModal;