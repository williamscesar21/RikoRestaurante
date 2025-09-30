import React, { useState, useEffect } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import '../css/Ordenes.css';

const Ordenes = () => {
  // Leer el paso y el ID de la orden desde el localStorage
  const storedStep = localStorage.getItem('step');
  const storedOrdenId = localStorage.getItem('ordenId');

  const [step, setStep] = useState(storedStep ? parseInt(storedStep) : 1);  // Estado que maneja en qué paso estamos
  const [ordenId, setOrdenId] = useState(storedOrdenId ? storedOrdenId : null);  // Estado para almacenar el ID de la orden

  // Guardar los cambios en el localStorage cuando los valores cambien
  useEffect(() => {
    localStorage.setItem('step', step);
    localStorage.setItem('ordenId', ordenId);
  }, [step, ordenId]);

  // Cambiar al siguiente paso
  const handleNextStep = () => {
    setStep(step + 1);
  };

  // Cambiar al paso anterior
  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Cambiar al paso 1
  const handleReset = () => {
    setStep(1);
    setOrdenId(null);  // También resetear el ordenId cuando se reinicia el proceso
  };

  // Esta función se pasará a Step1 para capturar el ID de la orden una vez que se cree
  const handleOrdenCreada = (id) => {
    setOrdenId(id);  // Guardar el ID de la orden creada
    handleNextStep(); // Avanzar al siguiente paso
  };

  return (
    <div className="ordenes-container">
      <h1>Gestión de Órdenes</h1>
      
      {/* Paso 1: Crear nueva orden */}
      {step === 1 && <Step1 handleOrdenCreada={handleOrdenCreada} handleNextStep={handleNextStep} />}
      
      {/* Paso 2: Añadir productos a la orden */}
      {step === 2 && <Step2 handleNextStep={handleNextStep} handlePrevStep={handlePrevStep} ordenId={ordenId} />}
      
      {/* Paso 3: Finalizar orden */}
      {step === 3 && <Step3 handlePrevStep={handlePrevStep} handleReset={handleReset} ordenId={ordenId}/>}

    </div>
  );
};

export default Ordenes;
