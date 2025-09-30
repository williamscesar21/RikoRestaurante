import axios from 'axios';

// Base URL de tu API
const API_URL = 'http://192.168.100.106:5000';

export const fetchCategorias = () => axios.get(`${API_URL}/categorias`);
export const fetchProductos = () => axios.get(`${API_URL}/productos`);
export const fetchClientes = () => axios.get(`${API_URL}/clientes`);
export const fetchMeseros = () => axios.get(`${API_URL}/meseros`);

export const createCategoria = (data) => axios.post(`${API_URL}/categorias`, data);
export const createProducto = (data) => axios.post(`${API_URL}/productos`, data);
export const createCliente = (data) => axios.post(`${API_URL}/clientes`, data);
export const createMesero = (data) => axios.post(`${API_URL}/meseros`, data);
