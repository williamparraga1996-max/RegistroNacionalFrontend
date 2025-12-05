import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://registronacional-production.up.railway.app/api';

function App() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCiudad, setSearchCiudad] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ciudad: '',
    ocupacion: '',
    relato: ''
  });

  // Cargar personas al iniciar
  useEffect(() => {
    cargarPersonas();
  }, []);

  // 👇 CARGAR: Ordena por fecha DESC (más nuevos primero)
  const cargarPersonas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/personas`);
      if (!response.ok) throw new Error('Error al cargar personas');
      const data = await response.json();
      // Los datos ya vienen ordenados por fecha DESC desde el backend
      setPersonas(data);
    } catch (err) {
      setError('❌ Error al cargar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 📊 DESCARGAR EXCEL
  const descargarExcel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/personas/descargar/excel`);
    
      if (!response.ok) throw new Error('Error al descargar');
    
      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registro-nacional.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    
      setError('✅ Excel descargado exitosamente');
    } catch (err) {
      setError('❌ Error al descargar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 👇 BUSCAR: Ordena por fecha DESC (más nuevos primero)
  const buscar = async () => {
    if (!searchNombre && !searchCiudad) {
      cargarPersonas();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchNombre) params.append('nombre', searchNombre);
      if (searchCiudad) params.append('ciudad', searchCiudad);

      const response = await fetch(`${API_URL}/personas/buscar?${params}`);
      if (!response.ok) throw new Error('Error en búsqueda');
      const data = await response.json();
      // Los datos ya vienen ordenados por fecha DESC desde el backend
      setPersonas(data);
    } catch (err) {
      setError('❌ Error en búsqueda: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido) {
      setError('❌ Nombre y apellido son requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al guardar');
      
      setFormData({
        nombre: '',
        apellido: '',
        ciudad: '',
        ocupacion: '',
        relato: ''
      });
      setShowForm(false);
      await cargarPersonas();
      setError('✅ Persona guardada exitosamente');
    } catch (err) {
      setError('❌ Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>📋 Registro Nacional Infieles 🇪🇨</h1>
        <p>Gestiona tu registro de personas</p>
      </header>

      {error && (
        <div className={`alert ${error.includes('✅') ? 'success' : 'error'}`}>
          {error}
        </div>
      )}

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="🔍 Buscar por ciudad..."
            value={searchCiudad}
            onChange={(e) => setSearchCiudad(e.target.value)}
          />
          <button onClick={buscar} disabled={loading} className="btn btn-search">
            {loading ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
          <button onClick={cargarPersonas} disabled={loading} className="btn btn-refresh">
            {loading ? '⏳ Cargando...' : '🔄 Recargar'}
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? '❌ Cancelar' : '➕ Agregar Persona'}
        </button>
        <button
          onClick={descargarExcel}
          disabled={loading}
          className="btn btn-download"
        >
          {loading ? '⏳ Descargando...' : '📊 Descargar Excel'}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Ocupación</label>
            <input
              type="text"
              name="ocupacion"
              value={formData.ocupacion}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Relato</label>
            <textarea
              name="relato"
              value={formData.relato}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '⏳ Guardando...' : '💾 Guardar'}
          </button>
        </form>
      )}

      <div className="personas-list">
        {loading && <p className="loading">⏳ Cargando...</p>}
        
        {!loading && personas.length === 0 && (
          <p className="empty">📭 No hay personas registradas</p>
        )}

        {personas.map(persona => (
          <div key={persona.id} className="persona-card">
            <div className="persona-header">
              <h3>{persona.nombre} {persona.apellido}</h3>
            </div>
            
            {persona.ciudad && (
              <p><strong>📍 Ciudad:</strong> {persona.ciudad}</p>
            )}
            
            {persona.ocupacion && (
              <p><strong>💼 Ocupación:</strong> {persona.ocupacion}</p>
            )}
            
            {persona.relato && (
              <p><strong>📝 Relato:</strong> {persona.relato}</p>
            )}
            
            <p className="date">
              📅 {persona.fecha ? (() => {
                const fecha = new Date(persona.fecha);
                const fechaEcuador = new Date(fecha.getTime() + (5 * 60 * 60 * 1000));
                return fechaEcuador.toLocaleString('es-EC', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              })() : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
