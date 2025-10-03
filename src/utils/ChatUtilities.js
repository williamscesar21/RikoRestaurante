import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "../firebase";
import imageCompression from "browser-image-compression";

// ==============================================
// ⏰ Formatear tiempo
// ==============================================
export const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffSec < 60) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs} h`;

  return date.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ==============================================
// 📡 Escuchar mensajes en tiempo real (chat activo)
// ==============================================
export const listenToMessages = (db, orderId, callback, notify = true) => {
  const q = query(
    collection(db, "RikoChat", orderId, "messages"),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const newMsg = { id: change.doc.id, ...change.doc.data() };
        callback((prev) => [...prev, newMsg]);

        if (notify && newMsg.senderId !== auth.currentUser?.uid) {
          triggerNotification(newMsg);
        }
      }
    });
  });
};

// ==============================================
// 🔔 Notificación Web
// ==============================================
const triggerNotification = (msg) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Nuevo mensaje 📩", {
      body: msg.type === "text" ? msg.content : "Te enviaron un archivo",
      icon: "/logoNaranja.png",
    });
  }
};

// 🔔 Notificación web + toast + sonido
const triggerToastNotification = (msg, orderId) => {
  if (!msg || !msg.content) return;

  let body =
    msg.type === "text"
      ? msg.content
      : msg.type === "image"
      ? "📷 Imagen enviada"
      : "📍 Ubicación compartida";

  // Mostrar notificación toast
  import("react-toastify").then(({ toast }) => {
    toast.info(`💬 Nuevo mensaje en pedido #${orderId}: ${body}`, {
      autoClose: 3000,
    });
  });

  // 🔊 Intentar reproducir sonido
  const audio = new Audio("/notify.mp3");
  audio.volume = 1.0;
  audio.play().catch((err) => {
    console.warn("⚠️ El navegador bloqueó el autoplay del sonido:", err);
  });
};


// ==============================================
// ✉️ Enviar texto
// ==============================================
export const sendMessage = async (db, orderId, senderType, content) => {
  if (!auth.currentUser || !content.trim()) return;
  await addDoc(collection(db, "RikoChat", orderId, "messages"), {
    senderId: auth.currentUser.uid,
    senderType,
    content,
    type: "text",
    timestamp: serverTimestamp(),
  });
};

// ==============================================
// 📎 Enviar archivo (comprimido antes de subir)
// ==============================================
export const sendFile = async (storage, db, orderId, file, senderType) => {
  if (!file || !auth.currentUser) return;

  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    const storageRef = ref(storage, `chat-files/${orderId}/${compressedFile.name}`);
    await uploadBytes(storageRef, compressedFile);
    const imageUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "RikoChat", orderId, "messages"), {
      senderId: auth.currentUser.uid,
      senderType,
      content: "Archivo enviado",
      type: "image",
      imageUrl,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ Error subiendo archivo:", error);
  }
};

// ==============================================
// 📍 Enviar ubicación
// ==============================================
export const sendLocation = async (db, orderId, senderType, coords) => {
  if (!auth.currentUser) return;
  const mapsUrl = `https://www.google.com/maps?q=${coords}`;
  await addDoc(collection(db, "RikoChat", orderId, "messages"), {
    senderId: auth.currentUser.uid,
    senderType,
    content: mapsUrl,
    type: "location",
    timestamp: serverTimestamp(),
  });
};

export const listenToAllOrdersMessages = (db, orderIds, activeOrderId = null) => {
  const unsubscribes = [];
  const seenMessages = new Set(); // ⚡ Evitar duplicados

  orderIds.forEach((orderId) => {
    const q = query(
      collection(db, "RikoChat", orderId, "messages"),
      orderBy("timestamp", "asc")
    );

    let firstLoad = true;

    const unsub = onSnapshot(q, (snapshot) => {
      // Ignorar primera carga (mensajes viejos)
      if (firstLoad) {
        firstLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = { id: change.doc.id, ...change.doc.data() };

          // ⚡ Evitar duplicados
          if (seenMessages.has(msg.id)) return;
          seenMessages.add(msg.id);

          // ⚡ Ignorar si estoy en el chat activo
          if (orderId === activeOrderId) return;

          // ⚡ Ignorar si el mensaje lo mandé yo
          if (msg.senderId === auth.currentUser?.uid) return;

          // ✅ Notificar SOLO mensajes nuevos
          triggerToastNotification(msg, orderId);
        }
      });
    });

    unsubscribes.push(unsub);
  });

  // Devuelve función para limpiar TODOS los listeners
  return () => unsubscribes.forEach((u) => u());
};

