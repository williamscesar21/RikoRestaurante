// src/fcm.js
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import app from "./firebase"; // inicialización de Firebase App

// ⚠️ VAPID KEY (asegúrate que está en Firebase Console > Cloud Messaging > Web Push certificates)
const VAPID_KEY =
  "BN-qSQD3nPKg3csqeQE9EnDFbHa31iIIceoP8JBFDnxQ6wVBaWrLIvIvliJVIL-MhZKZzDa8BT_ViodjcsojLgc";

// ✅ Obtener token de FCM con logs detallados
export async function getFcmTokenSafely() {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("⚠️ Este navegador no soporta FCM");
      return null;
    }

    console.log("🔔 Solicitando permiso de notificaciones...");
    const permission = await Notification.requestPermission();
    console.log("📌 Estado del permiso:", permission);

    if (permission !== "granted") {
      console.warn("❌ Permiso de notificaciones denegado por el usuario");
      return null;
    }

    // Esperamos el service worker
    const registration = await navigator.serviceWorker.ready;
    console.log("🛠️ Service Worker listo:", registration);

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    
    console.log("🔍 Token generado:", token);

    if (token) {
      console.log("✅ Token FCM obtenido:", token);
      return token;
    } else {
      console.warn("⚠️ No se pudo generar el token FCM");
      return null;
    }
  } catch (err) {
    console.error("❌ Error al obtener token FCM:", err);
    return null;
  }
}

// ✅ Listener para mensajes en primer plano
export function onForegroundMessage(cb) {
  isSupported().then((ok) => {
    if (!ok) {
      console.warn("⚠️ Este navegador no soporta mensajes en primer plano");
      return;
    }
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("📩 Mensaje recibido en foreground:", payload);
      cb(payload);
    });
  });
}
