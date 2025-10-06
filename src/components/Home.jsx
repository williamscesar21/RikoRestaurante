import React, { useState, useEffect } from 'react';
import '../css/Home.css';
import AccionesList from './AccionesList'; 

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <img className='Home-img' src="logoNaranja.png" alt="" />
        <h1>¡Bienvenido a tu portal de restaurante!</h1>
        <p className="home-subtitle">Organiza tus datos de forma eficiente y accesible en Riko.</p>
        <p className="home-subtitle">¿En qué deseas trabajar hoy?</p>
        <AccionesList />
      </div>
    </div>
  );
};

export default Home;
