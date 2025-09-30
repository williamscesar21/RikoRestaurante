import React, { useState } from 'react';
import '../css/ClienteModal.css';

const ClienteModal = ({ isOpen, onClose, clientes, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2>Seleccionar Cliente</h2>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredClientes.map(cliente => (
            <li key={cliente.id} onClick={() => {
              onSelect(cliente.id);
              handleClose(); // Limpiar el input al seleccionar
            }}>
              {cliente.nombre} - {cliente.cedula}
            </li>
          ))}
        </ul>
        <button onClick={handleClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ClienteModal;