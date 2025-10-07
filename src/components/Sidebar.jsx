import React, { useEffect, useState } from 'react';
import { FaHome, FaClipboardList } from 'react-icons/fa';
import { MdQueryStats } from "react-icons/md";
import { IoFastFood } from "react-icons/io5";
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';
import { FaUser } from "react-icons/fa";
import { IoExitOutline } from "react-icons/io5";
import ModalConfirmacion from './ModalConfirmacion';
import { MdManageAccounts } from "react-icons/md";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const restaurantId = localStorage.getItem('restaurantId');

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
            <FaClipboardList /> Pedidos
          </li>
        </Link>

        <Link to="/productos" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <IoFastFood /> Productos
          </li>
        </Link>

        <Link to="/clientes" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <FaUser /> Clientes
          </li>
        </Link>
        <Link to="/statistics" className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <MdQueryStats /> Estadísticas
          </li>
        </Link>
        <Link to={`/restaurant/${restaurantId}`} className="sidebar-link" onClick={isMobile ? toggleSidebar : null}>
          <li>
            <MdManageAccounts /> Config.
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
