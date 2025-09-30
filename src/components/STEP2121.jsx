const [clientes, setClientes] = useState([]);


useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesResponse, mesasResponse, meserosResponse, ordenesResponse] = await Promise.all([
          axios.get(`${api_base_url}/clientes`),
          axios.get(`${api_base_url}/mesas`),
          axios.get(`${api_base_url}/meseros`),
          axios.get(`${api_base_url}/ordenes`),
        ]);
        setClientes(clientesResponse.data);
        setMesas(mesasResponse.data); // Filtrar mesas libres
        setMeseros(meserosResponse.data);
        setOrdenes(ordenesResponse.data);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);



  const createOrden = async () => {
    try {
      // Fetch the latest open session
      const sesionesResponse = await axios.get(`${api_base_url}/sesiones`);
      const sesionesAbiertas = sesionesResponse.data.filter(sesion => sesion.estado === 'abierta');
      
      if (sesionesAbiertas.length === 0) {
        console.error("No hay sesiones abiertas.");
        alert("No hay sesiones abiertas.");
        return; // No open sessions available
      }
  
      
  
      // Create the order
      const response = await axios.post(`${api_base_url}/ordenes`, {
        cliente_id: clienteId,
        mesa,
        estado,
        mesero_id: meseroId
      });
  
      handleOrdenCreada(response.data.id);
      const ultimaSesionAbierta = sesionesAbiertas[0]; // Get the last open session
      // Update the state of the table to "ocupada"
      //await axios.put(`${api_base_url}/mesas/${mesa}`, { estado: 'ocupada' });
  
      // Add the order to the session using the latest open session ID
      await axios.post(`${api_base_url}/sesion_ordenes`, {
        sesion_id: ultimaSesionAbierta.id,
        orden_id: response.data.id
      });
  
      handleNextStep();
    } catch (error) {
      console.error("Error al crear la orden:", error);
    }
  };


  <div className="orden-add">
          <h2>Nueva Orden</h2>

          {/* Selección del Cliente */}
          <div className="form-group">
            <label htmlFor="cliente">Seleccionar Cliente:</label>
            <select 
              id="cliente" 
              value={clienteId} 
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Seleccionar Cliente</option>
              {clientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.cedula}
                </option>
              ))}
            </select>
            <Link to="/clientes" className="add-cliente-button">
              Añadir Cliente
            </Link>
          </div>

          {/* Selección de la Mesa */}
          <div className="form-group">
            <label htmlFor="mesa">Seleccionar Mesa:</label>
            <select 
              id="mesa" 
              value={mesa} 
              onChange={(e) => setMesa(e.target.value)}
            >
              <option value="">Seleccionar Mesa</option>
              {mesas.map(mesa => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.id}
                </option>
              ))}
            </select>
          </div>

          {/* Selección del Mesero */}
          <div className="form-group">
            <label htmlFor="mesero">Seleccionar Mesero:</label>
            <select 
              id="mesero" 
              value={meseroId} 
              onChange={(e) => setMeseroId(e.target.value)}
            >
              <option value="">Seleccionar Mesero</option>
              {meseros.map(mesero => (
                <option key={mesero.id} value={mesero.id}>
                  {mesero.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón para Crear Orden */}
          <div className="form-group">
            <button onClick={createOrden} className="create-orden-button">
              Tomar Orden
            </button>
          </div>
        </div>