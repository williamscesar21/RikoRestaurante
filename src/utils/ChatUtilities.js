// 📦 Firebase
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";


import { auth } from "../firebase";

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
// 📡 Escuchar mensajes en tiempo real
// ==============================================
export const listenToMessages = (db, orderId, callback, notify = true) => {
  const q = query(
    collection(db, "RikoChat", orderId, "messages"),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(fetchedMessages);

    if (notify && fetchedMessages.length > 0) {
      const lastMsg = fetchedMessages[fetchedMessages.length - 1];
      if (lastMsg.senderId !== auth.currentUser?.uid) {
        triggerNotification(lastMsg);
      }
    }
  });
};

// ==============================================
// ✉️ Enviar mensaje de texto
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
// 📎 Enviar archivo (comprobante, imagen, etc.)
// ==============================================
export const sendFile = async (storage, db, orderId, file, senderType) => {
  if (!file || !auth.currentUser) return;

  const storageRef = ref(storage, `chat-files/${orderId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "RikoChat", orderId, "messages"), {
    senderId: auth.currentUser.uid,
    senderType,
    content: "Archivo enviado",
    type: "image",
    imageUrl,
    timestamp: serverTimestamp(),
  });
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
