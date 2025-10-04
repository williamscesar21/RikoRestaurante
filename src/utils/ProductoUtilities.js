import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { toast } from "react-toastify";

// 📌 Obtener productos del restaurante
export const fetchProductos = async (restaurantId, setProductos) => {
  try {
    const { data } = await axios.get(
      "https://rikoapi.onrender.com/api/product/product"
    );
    const filtrados = data.filter((p) => p.id_restaurant === restaurantId);
    setProductos(filtrados);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
  }
};

// 📌 Subir imágenes al storage y devolver URLs
export const uploadImages = async (imageFiles) => {
  return Promise.all(
    imageFiles.map(async (file) => {
      const storageRef = ref(storage, `products/${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    })
  );
};

// 📌 Guardar producto nuevo
export const submitProducto = async (productData, imageFiles) => {
  try {
    const imageUrls = await uploadImages(imageFiles);

    await axios.post("https://rikoapi.onrender.com/api/product/product", {
      ...productData,
      images: imageUrls,
    });

    toast.success("✅ Producto agregado con éxito");
    setTimeout(() => window.location.reload(), 1500);
  } catch (error) {
    console.error("Error al agregar producto:", error);
    toast.error("❌ Error al agregar producto");
  }
};

// 📌 Suspender / Activar producto
export const toggleSuspender = async (id, fetchProductosFn) => {
  try {
    await axios.put(
      `https://rikoapi.onrender.com/api/product/product-suspender/${id}`
    );
    fetchProductosFn();
  } catch (error) {
    console.error("❌ Error al suspender producto:", error);
    toast.error("❌ No se pudo actualizar");
  }
};

export const availableTags = [
    "Desayunos",
    "Almuerzos",
    "Cena",
    "Comida Rapida",
    "Pizza",
    "Parrilla / Carnes",
    "Sushi / Asia",
    "Comida Criolla",
    "Saludable / Fit",
    "Comida Gourmet",
    "Postres",
    "Bebidas",
    "Cafe / Te",
    "Hamburguesas",
    "Ensaladas",
    "Pasta",
    "Mariscos",
    "Pizzas",
    "Vegano / Vegetariano",
    "Comida Mexicana",  
];