import React, { useState, useEffect } from "react";
import "../css/Producto.css";
import {
  fetchProductos,
  submitProducto,
  toggleSuspender,
  availableTags,
} from "../utils/ProductoUtilities";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Producto = () => {
  const restaurantId = localStorage.getItem("restaurantId");
  const navigate = useNavigate();

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
  const [productos, setProductos] = useState([]);

  // 🔍 Estados para filtros
  const [filtroTag, setFiltroTag] = useState("Todos");
  const [filtroPrecio, setFiltroPrecio] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  // 📌 Cargar productos
  useEffect(() => {
    if (restaurantId) {
      fetchProductos(restaurantId, setProductos);
    }
  }, [restaurantId]);

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
    await submitProducto(productData, imageFiles);
  };

  // 📌 Aplicar filtros
  const productosFiltrados = productos
    .filter((prod) =>
      filtroTag === "Todos" ? true : prod.tags?.includes(filtroTag)
    )
    .filter((prod) => {
      if (filtroPrecio === "Todos") return true;
      const precio = prod.precio;
      if (filtroPrecio === "<5") return precio < 5;
      if (filtroPrecio === "5-10") return precio >= 5 && precio <= 10;
      if (filtroPrecio === "10-20") return precio > 10 && precio <= 20;
      if (filtroPrecio === ">20") return precio > 20;
      return true;
    })
    .filter(
      (prod) =>
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

  return (
    <div className="producto-container">
      <h1>Gestión de Productos</h1>

      {/* Botón que despliega el formulario */}
      <button
        className="toggle-form-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cerrar Formulario" : "Agregar Producto"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className={`producto-form ${showForm ? "show" : ""}`}
        >
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
                className={`tag-item ${
                  productData.tags.includes(tag) ? "selected" : ""
                }`}
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

          <div className="image-upload-container">
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
                      onClick={() => {
                        setImagePreviews((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setImageFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
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

      {/* 📌 Filtros */}
      <div className="filtros-container">
        <h3>Filtrar por categoría:</h3>
        <div className="filtros-tags">
          {["Todos", ...availableTags].map((tag) => (
            <button
              key={tag}
              className={`filtro-btn ${filtroTag === tag ? "activo" : ""}`}
              onClick={() => setFiltroTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <h3>Filtrar por precio:</h3>
        <div className="filtros-precio">
          {["Todos", "<5", "5-10", "10-20", ">20"].map((rango) => (
            <button
              key={rango}
              className={`filtro-btn ${filtroPrecio === rango ? "activo" : ""}`}
              onClick={() => setFiltroPrecio(rango)}
            >
              {rango === "Todos"
                ? "Todos"
                : rango === "<5"
                ? "Menos de $5"
                : rango === "5-10"
                ? "$5 a $10"
                : rango === "10-20"
                ? "$10 a $20"
                : "Más de $20"}
            </button>
          ))}
        </div>

        <h3>Buscar producto:</h3>
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-input"
        />
      </div>

      {/* 📌 Listado de productos estilo cards */}
      <div className="productos-list">
        {productosFiltrados.length === 0 ? (
          <p className="empty-text">No se encontraron productos</p>
        ) : (
          productosFiltrados.map((prod) => (
            //el click no debe afectar al boton de suspender
            <div key={prod._id} className="producto-card">
              <img
                src={prod.images?.[0] || "/default-product.png"}
                alt={prod.nombre}
                className="producto-card-img"
                onClick={() => navigate(`/producto/${prod._id}`)}
                style={{ cursor: "pointer" }}
              />
              <div className="producto-card-body">
                <h3>{prod.nombre}</h3>
                <p>{prod.descripcion.split(" ").slice(0, 10).join(" ")}...</p>
                <p>
                  <strong>${prod.precio.toFixed(2)}</strong>
                </p>
                <div className="tags-list">
                  {prod.tags?.map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className={`suspender-btn ${prod.suspendido ? "off" : "on"}`}
                  onClick={() =>
                    toggleSuspender(prod._id, () =>
                      fetchProductos(restaurantId, setProductos)
                    )
                  }
                >
                  {prod.suspendido ? "Suspendido" : "Activo"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Producto;
