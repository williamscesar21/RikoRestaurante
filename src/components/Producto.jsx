import React, { useState } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import "../css/Producto.css";

// 📌 Importar Toastify (notificaciones internas)
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Producto = () => {
  const restaurantId = localStorage.getItem("restaurantId");

  const [productData, setProductData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    id_restaurant: restaurantId || "",
    tags: [],
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const availableTags = [
    "Desayuno",
    "Almuerzo",
    "Cena",
    "Bebida",
    "Postre",
    "Comida Rapida",
    "Comida Gourmet",
    "Nutricional",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };

  const handleImageChange = (files) => {
    if (files.length > 3 || imageFiles.length + files.length > 3) {
      toast.error("❌ Solo se pueden agregar hasta 3 imágenes.");
      return;
    }

    const fileArray = Array.from(files);
    const newImageFiles = fileArray.filter(
      (file) => !imageFiles.some((existingFile) => existingFile.name === file.name)
    );

    setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
    const previewUrls = newImageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...previewUrls]);
  };

  const handleTagChange = (tag) => {
    setProductData((prevData) => {
      const tagExists = prevData.tags.includes(tag);
      let newTags;

      if (tagExists) {
        newTags = prevData.tags.filter((t) => t !== tag);
      } else {
        if (prevData.tags.length >= 3) {
          toast.warning("⚠️ Solo se permiten 3 tags máximo.");
          return prevData;
        }
        newTags = [...prevData.tags, tag];
      }

      return { ...prevData, tags: newTags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storageRef = ref(storage, `products/${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      await axios.post("https://rikoapi.onrender.com/api/product/product", {
        ...productData,
        images: imageUrls,
      });

      toast.success("✅ Producto agregado con éxito");

      // ✅ También enviamos una notificación push local
      mostrarNotificacionPush("✅ Producto agregado", "Se guardó correctamente en el sistema");

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast.error("❌ Error al agregar producto");
      mostrarNotificacionPush("❌ Error", "Hubo un problema al guardar el producto");
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleImageChange(e.dataTransfer.files);
  };

  const handleImageRemove = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Notificación local interna (Toastify)
  const mostrarNotificacionToast = () => {
    toast.info("🔔 Probando notificación Toastify 🚀");
  };

  // ✅ Notificación push real del navegador
  const mostrarNotificacionPush = async (titulo = "🔔 Notificación", mensaje = "Esto es un push local") => {
    if (!("Notification" in window)) {
      toast.error("Tu navegador no soporta notificaciones push");
      return;
    }

    let permiso = Notification.permission;

    if (permiso !== "granted") {
      permiso = await Notification.requestPermission();
    }

    if (permiso === "granted") {
      new Notification(titulo, {
        body: mensaje,
        icon: "/logoNaranja.png", // opcional
      });
    } else {
      toast.warning("⚠️ No se concedió permiso para notificaciones");
    }
  };

  return (
    <div className="producto-container">
      <h1>Gestión de Productos</h1>

      {/* Botón de prueba Toastify */}
      <button onClick={mostrarNotificacionToast} className="toggle-form-button">
        Notificación Toastify
      </button>

     

      {/* Botón que despliega el formulario */}
      <button
        className="toggle-form-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cerrar Formulario" : "Agregar Producto"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={`producto-form ${showForm ? "show" : ""}`}>
          <label>
            Nombre:
            <input
              type="text"
              name="nombre"
              value={productData.nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Precio:
            <input
              type="number"
              name="precio"
              value={productData.precio}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Descripción:
            <textarea
              name="descripcion"
              value={productData.descripcion}
              onChange={handleChange}
              required
            ></textarea>
          </label>

          <div className="tags-container">
            <h3>Tags:</h3>
            {availableTags.map((tag, index) => (
              <label
                key={index}
                className={`tag-item ${productData.tags.includes(tag) ? "selected" : ""}`}
                onClick={() => handleTagChange(tag)}
              >
                <input
                  type="checkbox"
                  value={tag}
                  checked={productData.tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                />
                {tag}
              </label>
            ))}
          </div>

          <div
            className="image-upload-container"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e.target.files)}
              className="image-input"
            />
            <div className="upload-instructions">
              Seleccione imágenes o arrastre aquí (máx. 3).
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-preview-container">
                {imagePreviews.map((preview, index) => (
                  <div className="image-preview-wrapper" key={index}>
                    <span
                      className="delete-image-button"
                      onClick={() => handleImageRemove(index)}
                    >
                      ✕
                    </span>
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="image-preview"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit">Guardar Producto</button>
        </form>
      )}

      {/* Contenedor de notificaciones */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Producto;
