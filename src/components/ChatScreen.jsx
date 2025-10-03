import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "../css/ChatScreen.css";
import { ArrowLeft } from "react-feather";
import { CiImageOn } from "react-icons/ci";

import { db, storage } from "../firebase";
import {
  listenToMessages,
  sendMessage,
  sendFile,
  formatTime,
} from "../utils/ChatUtilities";

const ChatScreenRestaurant = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);

  // 👇 Abrir modal si viene del state o query param
  useEffect(() => {
    const state = window.history.state?.usr;
    const fromState = state?.showModal;
    const qp = searchParams.get("openModal");
    if (fromState || qp === "1" || qp?.toLowerCase() === "true") {
      setShowModal(true);
    }
  }, [searchParams]);

  // 🔄 Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = listenToMessages(db, orderId, setMessages, true);
    return () => unsubscribe();
  }, [orderId]);

  // ➡️ Enviar mensaje de texto
  const handleSendMessage = async () => {
    if (!orderId) return;
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
                <img src={msg.imageUrl} alt="Archivo" />
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

      {/* INPUT */}
      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje al cliente..."
        />
        <button className="upload-btn" onClick={() => setShowModal(true)}>
          <CiImageOn />
        </button>
        <button className="send-btn" onClick={handleSendMessage}>
          Enviar
        </button>
      </div>

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
    </div>
  );
};

export default ChatScreenRestaurant;
