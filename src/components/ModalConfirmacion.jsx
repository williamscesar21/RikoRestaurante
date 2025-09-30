import React from 'react';
import '../css/ModalConfirmacion.css'; // Asegúrate de crear un archivo CSS para el modal

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirmación</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="modal-button confirm">Sí</button>
          <button onClick={onClose} className="modal-button cancel">No</button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;