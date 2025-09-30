import React, { useState, useEffect } from 'react';
import { FaHome, FaClipboardList } from 'react-icons/fa';
import { IoFastFood } from "react-icons/io5";
import { Link } from 'react-router-dom';
import '../css/Header.css';
import { MdTableRestaurant } from "react-icons/md";
import { api_base_url } from '../../../ipconfig';

const Header = ({ toggleSidebar }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Verificar la conexión al backend
    const checkConnection = async () => {
      try {
        const response = await fetch(`${api_base_url}/`);
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Verifica cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-container">
      {/* Botón para abrir/cerrar el menú lateral */}
      <button className="menu-button" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Íconos fijos en el Header */}
      <div className="header-icons">
        <Link to="/" className="header-link">
          <FaHome />
        </Link>
        <Link to="/productos" className="header-link">
          <IoFastFood />
        </Link>
        <Link to="/ordenes" className="header-link">
          <FaClipboardList />
        </Link>
        <Link to="/mesas" className="header-link">
          <MdTableRestaurant />
        </Link>
      </div>

      {/* Estado de conexión al backend */}
      <h1
        className="restaurant-name"
        style={{
          color: 'white',
          padding: '0px 10px',
          borderRadius: '5px',
          fontSize: 'small',
          backgroundColor: isConnected ? 'green' : 'red',
        }}
      >
        {isConnected ? 'Online' : 'Offline'}
      </h1>
    </header>
  );
};

export default Header;
