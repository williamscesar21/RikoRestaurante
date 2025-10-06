import React from 'react';
import '../css/Loading.css';

const Loading = () => {
    return (
        <div className="loading-container">
            <img src="/logoNaranja.png" alt="Logo" className="loading-logo" />
            <p>Cargando...</p>
        </div>
    );
};

export default Loading;
