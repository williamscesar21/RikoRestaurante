import React from 'react';
import { Link } from 'react-router-dom';
import '../css/AccionesList.css';

const AccionesList = () => {
  return (
    <div className="acciones-container">
      <div className="acciones-buttons">
        {/* Órdenes */}
        <Link to="/ordenes">
          <button className="accion-button">Pedidos</button>
        </Link>

        {/* Productos y Categorías */}
        <Link to="/productos">
          <button className="accion-button">Productos</button>
        </Link>

        {/* Clientes */}
        <Link to="/clientes">
          <button className="accion-button">Clientes</button>
        </Link>

        {/* Sesiones de venta (si lo quieres visible también) */}
        {/* <Link to="/sesiones">
          <button className="accion-button">Sesiones</button>
        </Link> */}
      </div>
    </div>
  );
};

export default AccionesList;
