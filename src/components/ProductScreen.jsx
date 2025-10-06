import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/ProductScreen.css";
import { FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import { availableTags } from "../utils/ProductoUtilities";

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editable, setEditable] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    tags: [],
    suspendido: false,
  });

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `https://rikoapi.onrender.com/api/product/product/${id}`
        );
        setProduct(data);
        setEditable({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          tags: data.tags,
          suspendido: data.suspendido,
        });
        setSelectedImage(data.images?.[0] || null);

        const res = await axios.get(
          `https://rikoapi.onrender.com/api/restaurant/restaurant/${data.id_restaurant}`
        );
        setRestaurant(res.data);
      } catch (error) {
        console.error("❌ Error cargando producto:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditable((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag) => {
    setEditable((prev) => {
      const exists = prev.tags.includes(tag);
      let newTags = exists
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      if (newTags.length > 3) return prev;
      return { ...prev, tags: newTags };
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `https://rikoapi.onrender.com/api/product/product/${id}`,
        editable
      );
      setProduct((prev) => ({ ...prev, ...editable }));
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error al guardar cambios:", error);
    }
  };

  const handleCancel = () => {
    setEditable({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      tags: product.tags,
      suspendido: product.suspendido,
    });
    setIsEditing(false);
  };

  if (!product) return <div className="loading">Cargando producto...</div>;

  return (
    <div className="product-screen">
      <header className="product-header">

        {isEditing ? (
          <input
            className="product-name-input"
            name="nombre"
            value={editable.nombre}
            onChange={handleFieldChange}
            placeholder="Nombre del producto"
          />
        ) : (
          <h1>{product.nombre}</h1>
        )}

        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="btn-icon success" onClick={handleSave}>
                <FaCheck />
              </button>
              <button className="btn-icon danger" onClick={handleCancel}>
                <FaTimes />
              </button>
            </>
          ) : (
            <button
              className="btn-icon edit"
              onClick={() => setIsEditing(true)}
            >
              <FaPencilAlt />
            </button>
          )}
        </div>
      </header>

      <div className="product-layout">
        {/* IMÁGENES */}
        <section className="product-gallery">
          <div className="main-image">
            <img src={selectedImage} alt="producto" />
          </div>
          <div className="thumbnails">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`img-${i}`}
                className={selectedImage === img ? "selected" : ""}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </section>

        {/* INFORMACIÓN */}
        <section className="product-info">
          <div className="info-field">
            <label>Descripción</label>
            {isEditing ? (
              <textarea
                name="descripcion"
                value={editable.descripcion}
                onChange={handleFieldChange}
              />
            ) : (
              <p>{product.descripcion}</p>
            )}
          </div>

          <div className="info-field">
            <label>Precio</label>
            {isEditing ? (
              <input
                type="number"
                name="precio"
                value={editable.precio}
                onChange={handleFieldChange}
              />
            ) : (
              <p>${product.precio.toFixed(2)}</p>
            )}
          </div>

          <div className="info-field">
            <label>Estado</label>
            {isEditing ? (
              <select
                name="suspendido"
                value={editable.suspendido}
                onChange={handleFieldChange}
              >
                <option value={false}>Activo</option>
                <option value={true}>Suspendido</option>
              </select>
            ) : (
              <span
                className={`estado ${
                  product.suspendido ? "inactivo" : "activo"
                }`}
              >
                {product.suspendido ? "Suspendido" : "Activo"}
              </span>
            )}
          </div>

          <div className="info-field">
            <label>Categorías</label>
            {isEditing ? (
              <div className="tags-edit">
                {availableTags.map((tag) => (
                  <span
                    key={tag}
                    className={`tag ${
                      editable.tags.includes(tag) ? "selected" : ""
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="tags">
                {product.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductScreen;
