import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/RestaurantAccount.css";
import { FaPencilAlt, FaCheck, FaTimes, FaClock } from "react-icons/fa";
import { FaStar, FaImage } from "react-icons/fa6";

const RestaurantAccount = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState({
    nombre: "",
    descripcion: "",
    ubicacion: "",
    telefono: "",
    email: "",
    horario_de_trabajo: [],
    password: "",
    pagoMovil: {
      telefono: "",
      cedula: "",
      banco: "",
      nombreBanco: ""
    },
    image: null
  });

  // 📦 Cargar datos del restaurante
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `https://rikoapi.onrender.com/api/restaurant/restaurant/${id}`
        );
        setRestaurant(data);
        setFields({
          nombre: data.nombre,
          descripcion: data.descripcion,
          ubicacion: data.ubicacion,
          telefono: data.telefono,
          email: data.email,
          horario_de_trabajo: data.horario_de_trabajo || [],
          password: "",
          pagoMovil: data.pagoMovil || {
            telefono: "",
            cedula: "",
            banco: "",
            nombreBanco: ""
          },
          image: data.images?.[0] || null
        });
      } catch (error) {
        console.error("Error al obtener datos del restaurante:", error);
      }
    };
    fetchData();
  }, [id]);

  // ✏️ Manejadores
  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handlePagoMovilChange = (e) => {
    setFields({
      ...fields,
      pagoMovil: { ...fields.pagoMovil, [e.target.name]: e.target.value }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFields({ ...fields, image: URL.createObjectURL(file) });
    }
  };

  const handleScheduleChange = (dayIndex, rangoIndex, field, value) => {
    const newHorario = [...fields.horario_de_trabajo];
    newHorario[dayIndex].rangos[rangoIndex][field] = value;
    setFields({ ...fields, horario_de_trabajo: newHorario });
  };

  const addRango = (dayIndex) => {
    const newHorario = [...fields.horario_de_trabajo];
    newHorario[dayIndex].rangos.push({ inicio: "00:00", fin: "00:00" });
    setFields({ ...fields, horario_de_trabajo: newHorario });
  };

  const removeRango = (dayIndex, rangoIndex) => {
    const newHorario = [...fields.horario_de_trabajo];
    newHorario[dayIndex].rangos.splice(rangoIndex, 1);
    setFields({ ...fields, horario_de_trabajo: newHorario });
  };

const saveChanges = async () => {
  try {
    setIsEditing(false);

    const updates = [];

    if (restaurant.nombre !== fields.nombre)
      updates.push({ propiedad: "nombre", valor: fields.nombre });
    if (restaurant.descripcion !== fields.descripcion)
      updates.push({ propiedad: "descripcion", valor: fields.descripcion });
    if (restaurant.ubicacion !== fields.ubicacion)
      updates.push({ propiedad: "ubicacion", valor: fields.ubicacion });
    if (restaurant.telefono !== fields.telefono)
      updates.push({ propiedad: "telefono", valor: fields.telefono });
    if (restaurant.email !== fields.email)
      updates.push({ propiedad: "email", valor: fields.email });

    // 🔹 Normalizamos las horas a formato 2 dígitos antes de comparar
    const normalizeTime = (t) => {
      if (!t) return "00:00";
      const [h, m] = t.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    };

    const oldHorario = restaurant.horario_de_trabajo || [];
    const newHorario = fields.horario_de_trabajo || [];
    let horarioChanged = false;

    if (oldHorario.length !== newHorario.length) {
      horarioChanged = true;
    } else {
      for (let i = 0; i < newHorario.length; i++) {
        const oldDay = oldHorario[i];
        const newDay = newHorario[i];

        if (oldDay.dia !== newDay.dia || oldDay.rangos.length !== newDay.rangos.length) {
          horarioChanged = true;
          break;
        }

        for (let j = 0; j < newDay.rangos.length; j++) {
          const oldInicio = normalizeTime(oldDay.rangos[j].inicio);
          const oldFin = normalizeTime(oldDay.rangos[j].fin);
          const newInicio = normalizeTime(newDay.rangos[j].inicio);
          const newFin = normalizeTime(newDay.rangos[j].fin);

          if (oldInicio !== newInicio || oldFin !== newFin) {
            horarioChanged = true;
            break;
          }
        }

        if (horarioChanged) break;
      }
    }

    if (horarioChanged)
      updates.push({ propiedad: "horario_de_trabajo", valor: newHorario });

    if (JSON.stringify(restaurant.pagoMovil) !== JSON.stringify(fields.pagoMovil))
      updates.push({ propiedad: "pagoMovil", valor: fields.pagoMovil });

    if (updates.length === 0) {
      alert("No se detectaron cambios para guardar.");
      return;
    }

    // 🔸 Enviar cada cambio
    const responses = await Promise.all(
      updates.map((u) =>
        axios.put(`https://rikoapi.onrender.com/api/restaurant/restaurant/${id}`, u)
      )
    );

    // ✅ Volver a obtener los datos actualizados desde el backend
    const { data } = await axios.get(
      `https://rikoapi.onrender.com/api/restaurant/restaurant/${id}`
    );
    setRestaurant(data);

    alert("Datos actualizados correctamente ✅");
  } catch (error) {
    console.error("Error al guardar cambios:", error);
    alert("Hubo un error al guardar los cambios ❌");
  }
};



  // 🔐 Actualizar contraseña
  const updatePassword = async () => {
    if (!fields.password.trim()) return alert("Introduce una contraseña válida");
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/restaurant/restaurant-password/${id}`,
        { password: fields.password }
      );
      alert("Contraseña actualizada correctamente");
      setFields({ ...fields, password: "" });
    } catch (error) {
      alert("Error al actualizar la contraseña");
    }
  };

  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  if (!restaurant)
    return (
      <div className="loading-screen">
        <p>Cargando información del restaurante...</p>
      </div>
    );

  return (
    <div className="account-container">
      {/* ENCABEZADO */}
      <div className="account-header">
        <div className="account-image">
          {fields.image ? (
            <img src={fields.image} alt="Restaurante" />
          ) : (
            <div className="placeholder-image">
              <FaImage size={40} color="#ccc" />
            </div>
          )}
          {isEditing && (
            <input type="file" accept="image/*" onChange={handleImageChange} />
          )}
        </div>

        <div className="account-info">
          {isEditing ? (
            <input
              name="nombre"
              value={fields.nombre}
              onChange={handleChange}
              className="account-name-input"
            />
          ) : (
            <h1 className="account-name">{restaurant.nombre}</h1>
          )}

          <p className="account-rating">
            <FaStar /> {restaurant.calificacion?.promedio?.toFixed(1) || "0.0"} (
            {restaurant.calificacion?.calificaciones?.length || 0})
          </p>

          <p>
            {/* <FaLocationDot />{" "} */}
            {isEditing ? (
              <input
                name="ubicacion"
                value={fields.ubicacion}
                onChange={handleChange}
                className="account-field"
              />
            ) : (
              restaurant.ubicacion
            )}
          </p>

          <p>
            {isEditing ? (
              <textarea
                name="descripcion"
                value={fields.descripcion}
                onChange={handleChange}
                className="account-description"
              />
            ) : (
              restaurant.descripcion
            )}
          </p>
        </div>

        {/* BOTONES */}
        <div className="account-buttons">
          {isEditing ? (
            <>
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                <FaTimes />
              </button>
              <button className="btn-save" onClick={saveChanges}>
                <FaCheck />
              </button>
            </>
          ) : (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <FaPencilAlt />
            </button>
          )}
        </div>
      </div>

      {/* CONTACTO */}
      <div className="account-details">
        <h2>Datos de Contacto</h2>
        <p>
          <strong>Teléfono:</strong>{" "}
          {isEditing ? (
            <input name="telefono" value={fields.telefono} onChange={handleChange} />
          ) : (
            restaurant.telefono
          )}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {isEditing ? (
            <input name="email" value={fields.email} onChange={handleChange} />
          ) : (
            restaurant.email
          )}
        </p>
      </div>

      {/* HORARIO */}
      <div className="account-schedule">
        <h2>
          <FaClock /> Horario de Trabajo
        </h2>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Rangos</th>
            </tr>
          </thead>
          <tbody>
            {fields.horario_de_trabajo.map((dia, i) => (
              <tr key={i}>
                <td>{dia.dia.charAt(0).toUpperCase() + dia.dia.slice(1)}</td>
                <td>
                  {dia.rangos.map((rango, j) => (
                    <div key={j} className="schedule-range">
                      {isEditing ? (
                        <>
                          <input
                            type="time"
                            value={rango.inicio}
                            onChange={(e) =>
                              handleScheduleChange(i, j, "inicio", e.target.value)
                            }
                          />
                          <span>a</span>
                          <input
                            type="time"
                            value={rango.fin}
                            onChange={(e) =>
                              handleScheduleChange(i, j, "fin", e.target.value)
                            }
                          />
                          {dia.rangos.length > 1 && (
                            <button
                              onClick={() => removeRango(i, j)}
                              className="remove-range"
                            >
                              ✕
                            </button>
                          )}
                        </>
                      ) : (
                        <span>
                          {convertTo12HourFormat(rango.inicio)} -{" "}
                          {convertTo12HourFormat(rango.fin)}
                        </span>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button className="add-range" onClick={() => addRango(i)}>
                      ➕ Agregar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 💳 PAGO MÓVIL */}
      <div className="account-pm">
        <h2>Pago Móvil</h2>
        <div className="pm-grid">
          <div>
            <label>Teléfono</label>
            <input
              name="telefono"
              value={fields.pagoMovil.telefono}
              onChange={handlePagoMovilChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label>Cédula</label>
            <input
              name="cedula"
              value={fields.pagoMovil.cedula}
              onChange={handlePagoMovilChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label>Banco</label>
            <input
              name="banco"
              value={fields.pagoMovil.banco}
              onChange={handlePagoMovilChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label>Nombre del Banco</label>
            <input
              name="nombreBanco"
              value={fields.pagoMovil.nombreBanco}
              onChange={handlePagoMovilChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* 🔐 CONTRASEÑA */}
      <div className="account-password">
        <h2>Actualizar Contraseña</h2>
        <input
          type="password"
          placeholder="Nueva contraseña"
          name="password"
          value={fields.password}
          onChange={handleChange}
        />
        <button onClick={updatePassword}>Actualizar</button>
      </div>
    </div>
  );
};

export default RestaurantAccount;
