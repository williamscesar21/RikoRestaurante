import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "../css/ChatScreen.css";
import { ArrowLeft } from "react-feather";
import { CiImageOn } from "react-icons/ci";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";

import { db, storage } from "../firebase";
import {
  listenToMessages,
  sendMessage,
  sendFile,
  formatTime,
} from "../utils/ChatUtilities";

const ChatScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [pedidoEstado, setPedidoEstado] = useState(null);
  const [pagoRechazado, setPagoRechazado] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // 🖼️ para ver imagen
  const [zoom, setZoom] = useState(1);

  const messagesEndRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 👇 Abrir modal si viene del state o query param
  useEffect(() => {
    const state = window.history.state?.usr;
    const fromState = state?.showModal;
    const qp = searchParams.get("openModal");
    if (fromState || qp === "1" || qp?.toLowerCase() === "true") {
      setShowModal(true);
    }
  }, [searchParams]);

  // 🔄 Escuchar mensajes
  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = listenToMessages(db, orderId, setMessages, true);
    return () => unsubscribe();
  }, [orderId]);

  // 🔽 Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 📡 Estado del pedido
  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const { data } = await axios.get(
          `https://rikoapi.onrender.com/api/pedido/pedidos/${orderId}`
        );
        setPedidoEstado(data.estado);
      } catch (error) {
        console.error("❌ Error obteniendo pedido:", error);
      }
    };
    if (orderId) fetchPedido();
  }, [orderId]);

  // ➡️ Enviar mensaje
  const handleSendMessage = async () => {
    if (!orderId || !newMessage.trim()) return;
    await sendMessage(db, orderId, "restaurant", newMessage);
    setNewMessage("");
  };

  // 📎 Subir archivo
  const handleFileUpload = async () => {
    if (!orderId || !file) return;
    try {
      setIsUploading(true);
      await sendFile(storage, db, orderId, file, "restaurant");
      setFile(null);
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error subiendo archivo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Confirmar pago
  const handleConfirmarPago = async () => {
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/pedido/pedidos/${orderId}/confirmar_pago`
      );
      await sendMessage(db, orderId, "restaurant", "✅ Pago confirmado");
      closeModal();
      setPedidoEstado("confirmado");
    } catch (error) {
      console.error("❌ Error confirmando pago:", error);
    }
  };

  // ❌ Rechazar pago
  const handleRechazarPago = async () => {
    try {
      await sendMessage(db, orderId, "restaurant", "❌ Pago no recibido");
      setPagoRechazado(true);
    } catch (error) {
      console.error("❌ Error rechazando pago:", error);
    }
  };

  // 🖼️ Modal imagen con zoom
  const handleWheelZoom = (e) => {
    e.preventDefault();
    const newZoom = zoom + e.deltaY * -0.0015;
    setZoom(Math.min(Math.max(1, newZoom), 3)); // entre 1x y 3x
  };

  // Cerrar modal con Esc
  useEffect(() => {
    const closeOnEsc = (e) => e.key === "Escape" && setSelectedImage(null);
    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, []);

  return (
    <div className="chat-screen-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={20} />
      </button>

      {/* HEADER */}
      <div className="chat-header">
        <h2>Chat con Cliente</h2>
        <h6 style={{ color: "#888" }}>Pedido #{orderId}</h6>
      </div>

      {/* MENSAJES */}
      <div className="messages-container">
        {messages.length === 0 && (
          <p className="no-messages">No hay mensajes aún.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="message-wrapper">
            <div
              className={`message ${
                msg.senderType === "restaurant" ? "sent" : "received"
              }`}
            >
              {msg.type === "text" && <p>{msg.content}</p>}
              {msg.type === "image" && (
                <img
                  src={msg.imageUrl}
                  alt="Archivo"
                  className="chat-image"
                  onClick={() => {
                    setSelectedImage(msg.imageUrl);
                    setZoom(1);
                  }}
                />
              )}
              {msg.type === "location" && (
                <div className="location-message">
                  <p>📍 Ubicación de entrega</p>
                  <a
                    href={msg.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-button"
                  >
                    Abrir en Google Maps
                  </a>
                </div>
              )}
            </div>
            <span
              className={`message-time ${
                msg.senderType === "restaurant" ? "time-sent" : "time-received"
              }`}
            >
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 📌 BOTONES DE PAGO O INPUT */}
      {pedidoEstado === "Confirmando pago" ? (
        <div className="payment-actions">
          <button
            className="reject-btn"
            onClick={handleRechazarPago}
            disabled={isUploading}
          >
            Pago no recibido
          </button>
          <button
            className="confirm-btn"
            onClick={openModal}
            disabled={isUploading}
          >
            Pago confirmado
          </button>
        </div>
      ) : (
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isUploading || pagoRechazado}
          />
          <button className="upload-btn" onClick={() => setShowModal(true)}>
            <CiImageOn />
          </button>
          <button className="send-btn" onClick={handleSendMessage}>
            Enviar
          </button>
        </div>
      )}

      {/* MODAL ARCHIVO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Subir archivo</h3>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              className="file-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload" className="custom-upload-btn">
              📎 Subir archivo
            </label>
            {file && <span className="file-name">{file.name}</span>}
            {file && (
              <div className="preview">
                <img src={URL.createObjectURL(file)} alt="preview" />
              </div>
            )}
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button
                className="send-proof-btn"
                onClick={handleFileUpload}
                disabled={!file || isUploading}
              >
                {isUploading ? "Enviando..." : "Enviar Archivo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ MODAL DE IMAGEN CON ZOOM */}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="zoom"
            className="image-modal"
            style={{ transform: `scale(${zoom})` }}
            onWheel={handleWheelZoom}
          />
        </div>
      )}

      <ModalConfirmacion
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmarPago}
        message="¿Estás seguro de confirmar el pago?"
        concept="Una vez confirmado, no podrás revertir esta acción."
      />
    </div>
  );
};

export default ChatScreen;
