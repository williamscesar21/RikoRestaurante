/* public/firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCv1uxTpLa6jk1DLJcbFJCEuwoseO8JJMc",
  authDomain: "rikoweb-ff259.firebaseapp.com",
  projectId: "rikoweb-ff259",
  storageBucket: "rikoweb-ff259.appspot.com",
  messagingSenderId: "15088740264",
  appId: "1:15088740264:web:3383a1309798bbf2d35f9d",
  measurementId: "G-BFRJ1NBC54",
});

const messaging = firebase.messaging();

// 🔔 Manejo de notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Notificación recibida en background:", payload);

  const title = payload.notification?.title || "Nuevo pedido";
  const options = {
    body: payload.notification?.body || "Tienes un nuevo pedido",
    icon: "/logoNaranja.png",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});
