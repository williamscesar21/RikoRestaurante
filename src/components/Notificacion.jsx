import React, { useEffect, useState } from 'react';
import '../css/Notificacion.css'; // Asegúrate de crear este archivo CSS

const Notificacion = ({ tipo, mensaje }) => {
    const [visible, setVisible] = useState(true);

    // useEffect(() => {
    //     // Mostrar la notificación durante 3 segundos
    //     const timer = setTimeout(() => {
    //         setVisible(false);
    //     }, 3000);

    //     // Limpiar el temporizador si el componente se desmonta antes de 3 segundos
    //     return () => clearTimeout(timer);
    // }, []);

    let claseNotificacion = '';
    let icono = '';

    switch (tipo) {
        case 'exitoso':
            claseNotificacion = 'notificacion-exito';
            icono = '✔️';
            break;
        case 'error':
            claseNotificacion = 'notificacion-error';
            icono = '❌'; // Puedes usar un icono más sofisticado si lo prefieres
            break;
        case 'procesando':
            claseNotificacion = 'notificacion-procesando';
            icono = '⏳'; // Puedes usar un icono más sofisticado si lo prefieres
            break;
        default:
            claseNotificacion = 'notificacion-oculta';
            break;
    }

    return (
        <div className={`notificacion ${claseNotificacion} ${!visible ? 'notificacion-oculta' : ''}`}>
            <span className="notificacion-icono">{icono}</span>
            <span className="notificacion-mensaje">{mensaje}</span>
        </div>
    );
};

export default Notificacion;
