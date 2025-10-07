import { useState } from "react";
import axios from "axios";
import '../css/PagoMovilForm.css';

const venezuelanBanks = [
    { code: '0001', name: 'Banco Central de Venezuela' },
    { code: '0102', name: 'Banco de Venezuela, S.A. Banco Universal' },
    { code: '0104', name: 'Banco Venezolano de Crédito, S.A. Banco Universal' },
    { code: '0105', name: 'Banco Mercantil, C.A. Banco Universal' },
    { code: '0108', name: 'Banco Provincial, S.A. Banco Universal' },
    { code: '0114', name: 'Banco del Caribe C.A., Banco Universal (Bancaribe)' },
    { code: '0115', name: 'Banco Exterior, C.A. Banco Universal' },
    { code: '0128', name: 'Banco Caroní, C.A. Banco Universal' },
    { code: '0134', name: 'Banesco Banco Universal, C.A.' },
    { code: '0137', name: 'Banco Sofitasa, Banco Universal' },
    { code: '0138', name: 'Banco Plaza, C.A. Banco Universal' },
    { code: '0151', name: 'Banco Fondo Común, C.A. Banco Universal (BFC)' },
    { code: '0156', name: '100% Banco, Banco Universal, C.A.' },
    { code: '0157', name: 'DELSUR Banco Universal, C.A.' },
    { code: '0163', name: 'Banco del Tesoro, C.A. Banco Universal' },
    { code: '0166', name: 'Banco Agrícola de Venezuela, C.A. Banco Universal' },
    { code: '0168', name: 'Bancrecer, S.A. Banco Microfinanciero' },
    { code: '0169', name: 'Mi Banco, Banco Microfinanciero, C.A.' },
    { code: '0171', name: 'Banco Activo, C.A. Banco Universal' },
    { code: '0172', name: 'Bancamiga Banco Universal, C.A.' },
    { code: '0174', name: 'Banplus Banco Universal, C.A.' },
    { code: '0175', name: 'Banco Bicentenario del Pueblo, Banco Universal, C.A.' },
    { code: '0177', name: 'Banco de la Fuerza Armada Nacional Bolivariana (Banfanb)' },
    { code: '0191', name: 'Banco Nacional de Crédito, C.A. Banco Universal' }
];

const PagoMovilForm = ({ id, setNotification, setRestaurant, restaurant, isEditing }) => {
    const [formFields, setFormFields] = useState({
        telefonoPagoMovil: restaurant?.pagoMovil?.telefono || '',
        cedulaPagoMovil: restaurant?.pagoMovil?.cedula || '',
        bancoPagoMovil: restaurant?.pagoMovil?.banco || ''
    });

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormFields({
            ...formFields,
            [name]: value
        });
    };

    const handleAddPagoMovil = (e) => {
        e.preventDefault();

        // Validar que todos los campos estén completos
        const { telefonoPagoMovil, cedulaPagoMovil, bancoPagoMovil } = formFields;
        if (!telefonoPagoMovil || !cedulaPagoMovil || !bancoPagoMovil) {
            setNotification({
                visible: true,
                mensaje: 'Todos los campos de Pago Móvil son requeridos',
                tipo: 'error'
            });
            return;
        }

        // Obtener el nombre del banco basado en el código seleccionado
        const selectedBank = venezuelanBanks.find(bank => bank.code === bancoPagoMovil);
        if (!selectedBank) {
            setNotification({
                visible: true,
                mensaje: 'Banco seleccionado inválido',
                tipo: 'error'
            });
            return;
        }

        setNotification({
            visible: true,
            mensaje: 'Procesando datos de Pago Móvil...',
            tipo: 'procesando'
        });

        // Enviar la solicitud al endpoint de Pago Móvil
        axios.post(`https://rikoapi.onrender.com/api/restaurant/restaurant-pago-movil/${id}`, {
            telefono: telefonoPagoMovil,
            cedula: cedulaPagoMovil,
            banco: bancoPagoMovil,
            nombreBanco: selectedBank.name
        })
            .then(response => {
                setRestaurant(prevState => ({
                    ...prevState,
                    pagoMovil: response.data.data.pagoMovil
                }));
                setNotification({
                    visible: true,
                    mensaje: 'Datos de Pago Móvil agregados exitosamente',
                    tipo: 'exitoso'
                });
                setTimeout(() => {
                    setNotification({
                        visible: false,
                        mensaje: '',
                        tipo: ''
                    });
                }, 3000);
                // Limpiar los campos del formulario
                setFormFields({
                    telefonoPagoMovil: '',
                    cedulaPagoMovil: '',
                    bancoPagoMovil: ''
                });
            })
            .catch(error => {
                console.error("Error al agregar datos de Pago Móvil:", error);
                setNotification({
                    visible: true,
                    mensaje: 'Error al agregar datos de Pago Móvil. Inténtelo de nuevo',
                    tipo: 'error'
                });
            });
    };

    const actualizarPagoMovil = (e) => {
        e.preventDefault();

        // Validar que todos los campos estén completos
        const { telefonoPagoMovil, cedulaPagoMovil, bancoPagoMovil } = formFields;
        if (!telefonoPagoMovil || !cedulaPagoMovil || !bancoPagoMovil) {
            setNotification({
                visible: true,
                mensaje: 'Todos los campos de Pago Móvil son requeridos',
                tipo: 'error'
            });
            return;
        }

        // Obtener el nombre del banco basado en el código seleccionado
        const selectedBank = venezuelanBanks.find(bank => bank.code === bancoPagoMovil);
        if (!selectedBank) {
            setNotification({
                visible: true,
                mensaje: 'Banco seleccionado inválido',
                tipo: 'error'
            });
            return;
        }

        setNotification({
            visible: true,
            mensaje: 'Actualizando datos de Pago Móvil...',
            tipo: 'procesando'
        });

        // Enviar la solicitud al endpoint de Pago Móvil
        axios.put(`https://rikoapi.onrender.com/api/restaurant/restaurant-pago-movil/${id}`, {
            telefono: telefonoPagoMovil,
            cedula: cedulaPagoMovil,
            banco: bancoPagoMovil,
            nombreBanco: selectedBank.name
        })
            .then(response => {
                setRestaurant(prevState => ({
                    ...prevState,
                    pagoMovil: response.data.data.pagoMovil
                }));
                setNotification({
                    visible: true,
                    mensaje: 'Datos de Pago Móvil actualizados exitosamente',
                    tipo: 'exitoso'
                });
                setTimeout(() => {
                    setNotification({
                        visible: false,
                        mensaje: '',
                        tipo: ''
                    });
                }, 3000);
            })
            .catch(error => {
                console.error("Error al actualizar datos de Pago Móvil:", error);
                setNotification({
                    visible: true,
                    mensaje: 'Error al actualizar datos de Pago Móvil. Inténtelo de nuevo',
                    tipo: 'error'
                });
            });
    };

    return (
        <div className="pago-movil-section">
            <h2>Datos de Pago Móvil</h2>
            {isEditing && (
                            <div>
                <div className="form-group">
                    <label htmlFor="telefonoPagoMovil">Teléfono:</label>
                    <input
                        type="text"
                        id="telefonoPagoMovil"
                        name="telefonoPagoMovil"
                        value={formFields.telefonoPagoMovil}
                        onChange={handleFieldChange}
                        placeholder="Ej: 04141234567"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cedulaPagoMovil">Cédula:</label>
                    <input
                        type="text"
                        id="cedulaPagoMovil"
                        name="cedulaPagoMovil"
                        value={formFields.cedulaPagoMovil}
                        onChange={handleFieldChange}
                        placeholder="Ej: V-12345678"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="bancoPagoMovil">Banco:</label>
                    <select
                        id="bancoPagoMovil"
                        name="bancoPagoMovil"
                        value={formFields.bancoPagoMovil}
                        onChange={handleFieldChange}
                        required
                    >
                        <option value="">Seleccione un banco</option>
                        {venezuelanBanks.map(bank => (
                            <option key={bank.code} value={bank.code}>{bank.name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={restaurant?.pagoMovil ? actualizarPagoMovil : handleAddPagoMovil} className="add-pago-movil-button">
                    {restaurant?.pagoMovil ? 'Actualizar Pago Móvil' : 'Agregar Pago Móvil'}
                </button>
            </div>
            )}

            {restaurant?.pagoMovil && (
                <div className="pago-movil-details">
                    <p><strong>Teléfono Pago Móvil:</strong> {restaurant.pagoMovil.telefono}</p>
                    <p><strong>Cédula:</strong> {restaurant.pagoMovil.cedula}</p>
                    <p><strong>Banco:</strong> {restaurant.pagoMovil.nombreBanco} ({restaurant.pagoMovil.banco})</p>
                </div>
            )}
        </div>
    );
};

export default PagoMovilForm;