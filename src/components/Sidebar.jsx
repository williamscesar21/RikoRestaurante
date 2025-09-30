import React, { useEffect, useState } from 'react';
import { FaHome, FaClipboardList } from 'react-icons/fa';
import { IoFastFood } from "react-icons/io5";
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';
import { BiSolidCategory } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { FaChalkboardUser } from "react-icons/fa6";
import { MdTableRestaurant } from "react-icons/md";
import { IoExitOutline } from "react-icons/io5";
import ModalConfirmacion from './ModalConfirmacion';

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detectar tamaño de la ventana
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);

    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('restaurantName');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rol');
    window.location.href = '/login';
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <button className="menu-button" onClick={toggleSidebar}>
        ☰
      </button>

      <div className="sidebar-header">
        <img src="logoNaranja.png" alt="Logo" className="sidebar-logo" />
      </div>

      <ul>
        <Link to="/" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <FaHome /> Inicio
          </li>
        </Link>

        <Link to="/ordenes" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <FaClipboardList /> Órdenes
          </li>
        </Link>

        <Link to="/productos" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <IoFastFood /> Productos
          </li>
        </Link>

        <Link to="/categorias" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <BiSolidCategory /> Categorías
          </li>
        </Link>

        <Link to="/clientes" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <FaUser /> Clientes
          </li>
        </Link>

        <Link to="/meseros" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <FaUser /> Meseros
          </li>
        </Link>

        <Link to="/sesiones" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <FaChalkboardUser /> Sesiones
          </li>
        </Link>

        <Link to="/mesas" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <MdTableRestaurant /> Mesas
          </li>
        </Link>

        {/* Logout */}
        <Link to="#" className="sidebar-link" onClick={openModal}>
          <li>
            <IoExitOutline /> Cerrar Sesión
          </li>
        </Link>
      </ul>

      <footer className="sidebar-footer">
        <a target="_blank" href="https://webbonding.onrender.com" rel="noreferrer">
          © 2025 Web Bonding
        </a>
      </footer>

      {/* Modal de confirmación */}
      <ModalConfirmacion
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmLogout}
        message="¿Estás seguro de que deseas cerrar sesión?"
      />
    </div>
  );
};

export default Sidebar;
