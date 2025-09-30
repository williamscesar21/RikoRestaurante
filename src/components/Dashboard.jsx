import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

import '../css/Dashboard.css';        // estilos que ves debajo
import { api_base_url } from '../../../ipconfig'; // tu endpoint base

// Registrar sólo una vez los elementos de Chart.js
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

// Colores reutilizables para todos los gráficos
const COLORS = ['#6366f1', '#06b6d4', '#facc15', '#fb923c', '#8b5cf6'];

export default function Dashboard() {
  /* ----------------------------- STATE -------------------------------- */
  const [ventasFecha,  setVentasFecha]  = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [ordenesSesion, setOrdenesSesion] = useState([]);
  const [acumulado,    setAcumulado]    = useState({
    total_ventas: 0,
    total2_ventas: 0,
    total_vuelto: 0,
  });
  const [loading, setLoading] = useState(true);

  /* ----------------------------- FETCH -------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const [vRes, pRes, sRes] = await Promise.all([
          fetch(`${api_base_url}/ventas_totales`),
          fetch(`${api_base_url}/top_productos?n=5`),
          fetch(`${api_base_url}/ordenes_por_sesion`),
        ]);

        const vJson = await vRes.json();
        setVentasFecha(vJson.ventas_por_fecha || []);
        setAcumulado(
          vJson.total_acumulado || { total_ventas: 0, total2_ventas: 0, total_vuelto: 0 }
        );

        setTopProductos(await pRes.json());
        setOrdenesSesion(await sRes.json());
      } catch (err) {
        console.error('Dashboard fetch error →', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------- DATA TRANSFORMATIONS ----------------------- */
  const barData = topProductos.map((p, i) => ({
    name: p.producto_id,
    total: p.total_vendido,
    fill: COLORS[i % COLORS.length],
  }));

  const pieData = {
    labels: ordenesSesion.slice(-5).map((s) => `Sesión ${s.sesion_id}`),
    datasets: [
      {
        data: ordenesSesion.slice(-5).map((s) => s.total_ordenes),
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS,
      },
    ],
  };

  /* ------------------------------- UI --------------------------------- */
  if (loading) {
    return (
      <div className="dashboard-container">
        <p className="loading">Cargando datos…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/*———— TÍTULO + BUSCADOR ————*/}
      <header className="dash-header">
        <h2>Dashboard de Estadísticas</h2>
        <input
          type="search"
          placeholder="Buscar…"
          className="dash-search"
          aria-label="Buscar"
        />
      </header>

      {/*———— TARJETAS KPI ————*/}
      <section className="kpi-grid">
        <article className="kpi">
          <h3>Total</h3>
          <p className="kpi-value accent">
            $
            {(
              acumulado.total_ventas +
              acumulado.total2_ventas -
              acumulado.total_vuelto
            ).toLocaleString()}
          </p>
        </article>

        <article className="kpi">
          <h3>Ingresos</h3>
          <p className="kpi-value positive">
            +$
            {(acumulado.total_ventas + acumulado.total2_ventas).toLocaleString()}
          </p>
        </article>

        <article className="kpi">
          <h3>Vuelto</h3>
          <p className="kpi-value negative">
            -${acumulado.total_vuelto.toLocaleString()}
          </p>
        </article>
      </section>

      {/*———— GRÁFICOS ————*/}
      <section className="chart-grid">
        {/* Línea */}
        <div className="card">
          <h3 className="card-title">Ventas por Fecha</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ventasFecha}>
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_ventas"
                stroke={COLORS[0]}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Barras */}
        <div className="card">
          <h3 className="card-title">Top Productos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pastel */}
        <div className="card card-wide">
          <h3 className="card-title">Órdenes por Sesión</h3>
          <div className="pie-wrap">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} redraw />
          </div>
        </div>
      </section>
    </div>
  );
}
