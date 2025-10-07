import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

import "../css/Dashboard.css";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

// 🎨 Colores globales
const COLORS = ["#6366f1", "#06b6d4", "#facc15", "#fb923c", "#8b5cf6"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const restaurantId = "68cba7725df1093fb48b3f10";
  const api_url = `https://rikoapi.onrender.com/api/restaurant/restaurant-estadisticas/${restaurantId}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(api_url);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="dashboard-container">
        <p className="loading">Cargando estadísticas...</p>
      </div>
    );

  if (!data)
    return (
      <div className="dashboard-container">
        <p className="error">No se pudieron cargar los datos.</p>
      </div>
    );

  const { resumen, topProductos, pedidosPorMes, estadosContados, clientesFrecuentes, actividadReciente } = data;

  /* ---------------- TRANSFORMAR DATOS ---------------- */

  // 📊 Pedidos por mes → LineChart
  const lineData = Object.entries(pedidosPorMes || {}).map(([mes, total]) => ({
    mes,
    pedidos: total,
  }));

  // 📦 Top productos → BarChart
  const barData = topProductos.map((p, i) => ({
    name: p.nombre,
    cantidad: p.cantidad,
    fill: COLORS[i % COLORS.length],
  }));

  // 🍕 Estados → Pie Chart
  const pieData = {
    labels: Object.keys(estadosContados || {}),
    datasets: [
      {
        data: Object.values(estadosContados || {}),
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS,
      },
    ],
  };

  /* ----------------- UI ----------------- */
  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h2>📊 Estadísticas del Restaurante</h2>
        <p className="restaurant-name">{data.restaurante.nombre}</p>
      </header>

      {/* -------- KPIs -------- */}
      <section className="kpi-grid">
        <article className="kpi">
          <h3>Pedidos Totales</h3>
          <p className="kpi-value accent">{resumen.totalPedidos}</p>
        </article>
        <article className="kpi">
          <h3>Ingresos Totales</h3>
          <p className="kpi-value positive">
            ${resumen.totalIngresos.toFixed(2)}
          </p>
        </article>
        <article className="kpi">
          <h3>Clientes Únicos</h3>
          <p className="kpi-value">{resumen.clientesUnicos}</p>
        </article>
        <article className="kpi">
          <h3>Calificación Promedio</h3>
          <p className="kpi-value">
            ⭐ {resumen.promedioCalificacion.toFixed(1)} / 5
          </p>
        </article>
      </section>

      {/* -------- GRÁFICOS -------- */}
      <section className="chart-grid">
        {/* Pedidos por mes */}
        <div className="card">
          <h3 className="card-title">Pedidos por Mes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              <Line
                type="monotone"
                dataKey="pedidos"
                stroke={COLORS[0]}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top productos */}
        <div className="card">
          <h3 className="card-title">Top Productos Más Vendidos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              <Bar dataKey="cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estados */}
        <div className="card card-wide">
          <h3 className="card-title">Pedidos por Estado</h3>
          <div className="pie-wrap">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </section>

      {/* -------- CLIENTES FRECUENTES -------- */}
      <section className="data-section">
        <h3>Clientes Frecuentes</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {clientesFrecuentes.map((c, i) => (
              <tr key={i}>
                <td>{c.nombre}</td>
                <td>{c.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* -------- ACTIVIDAD RECIENTE -------- */}
      <section className="data-section">
        <h3>Actividad Reciente</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {actividadReciente.map((a) => (
              <tr key={a.id}>
                <td>{a.cliente}</td>
                <td>${a.total.toFixed(2)}</td>
                <td>{a.estado}</td>
                <td>
                  {new Date(a.fecha).toLocaleString("es-VE", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
