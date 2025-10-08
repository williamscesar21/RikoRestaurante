import React, { useState, useEffect } from "react";
import "../css/Login.css";
import axios from "axios";
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFcmTokenSafely } from "../fcm"; // 👈 tu helper FCM

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hasOldFlag = localStorage.getItem("isAuthenticated") === "true";
    const hasToken = !!localStorage.getItem("token");
    if (hasOldFlag || hasToken) {
      window.location.href = "/";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) Login restaurante
      const response = await axios.post(
        "https://rikoapi.onrender.com/api/restaurant/restaurant-login",
        { correo: usuario, password: contrasena }
      );

      const { token, restaurant } = response.data;

      // 2) Guarda datos en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("restaurantName", restaurant.nombre);
      localStorage.setItem("restaurantId", restaurant._id);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("rol", restaurant.rol || "restaurant");

      // Config axios con token
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      // 3) Firebase custom token
      const firebaseResponse = await axios.post(
        "https://rikoapi.onrender.com/api/restaurant/restaurant-firebase-token",
        { token }
      );

      // 4) Sign-in Firebase
      await signInWithCustomToken(auth, firebaseResponse.data.firebaseToken);

      // 5) Escuchar cuando Firebase confirme login
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("✅ Usuario autenticado en Firebase:", user.uid);

          // 6) 🔔 Obtener y guardar token FCM
          const fcmToken = await getFcmTokenSafely();
          console.log("📲 Token recibido en Login:", fcmToken);
          if (fcmToken) {
            try {
              await axios.post("https://rikoapi.onrender.com/api/restaurant/save-fcm-token", {
                restaurantId: restaurant._id,
                token: fcmToken,
              });
              console.log("✅ FCM token guardado en backend");
            } catch (err) {
              console.warn("No se pudo guardar token FCM:", err?.response?.data || err.message);
            }
          }

          // 7) Redirigir al dashboard
          window.location.href = "/";
        } else {
          console.error("❌ Firebase no autenticó al usuario");
          setError("No se pudo iniciar sesión en Firebase");
        }
      });
    } catch (error) {
      let errorMessage = "Error al iniciar sesión. Verifica tus credenciales o intenta de nuevo.";
      if (error?.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Usuario o contraseña incorrectos.";
        } else if (error.response.status === 401) {
          errorMessage = `Token inválido para Firebase: ${error.response.data.details || "Sin detalles"}`;
        } else {
          errorMessage = error.response.data.error || "Error en el servidor.";
        }
      } else if (error?.code === "auth/invalid-custom-token") {
        errorMessage = "Token de Firebase inválido. Verifica la configuración del backend.";
      } else if (error?.code === "auth/configuration-not-found") {
        errorMessage = "Error de configuración de Firebase. Revisa firebase.js.";
      } else {
        errorMessage = error.message || "Error desconocido.";
      }
      console.error("❌ Error login restaurante:", error.response?.data || error);
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <img className="logo-login" src="logoBlanco.png" alt="" />
          <h2>Inicia Sesión</h2>
          <p style={{ color: "#fff" }}>
            Bienvenido, por favor ingrese sus credenciales
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
              className="input-login"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="input-login"
            />
            {error && <p className="error">{error}</p>}
            <button className="btn-login" type="submit">
              Iniciar Sesión
            </button>
          </form>
        </div>

        <div className="login-right">
          <img src="iphone.png" alt="Ilustración login" />
        </div>
      </div>
    </div>
  );
};

export default Login;
