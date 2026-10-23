import { useState } from 'react';

const BASE_PARQUEOS = [
  { id: 1, codigo: 'PRK-CS-01', nombre: 'PRK-CS-01 (Patio Central Sur)' },
  { id: 2, codigo: 'PRK-CS-02', nombre: 'PRK-CS-02 (Patio Central Norte)' },
  { id: 3, codigo: 'PRK-TR-01', nombre: 'PRK-TR-01 (Patio Norte)' }
];

const BASE_LINEAS = [
  { id: 1, codigo: 'R-05', nombre: 'R-05 - Ruta 5: Parque Colón <-> Puente Penitenciaría' },
  { id: 2, codigo: 'R-104', nombre: 'R-104 - Ruta 104: Barrio San Antonio <-> Cantón Victoria' },
  { id: 3, codigo: 'R-305', nombre: 'R-305 - Ruta 305: Bulevar Vista Hermosa <-> La Terminal' },
  { id: 4, codigo: 'R-402', nombre: 'R-402 - Ruta 402: Colonia Santa Fe <-> Av. Petapa / Ave. Castellana' },
  { id: 5, codigo: 'R-801', nombre: 'R-801 - Ruta 801: Bethania/Los Pinos <-> La Terminal' },
  { id: 6, codigo: 'R-802', nombre: 'R-802 - Ruta 802: El Amparo <-> Ave y 19 Calle Z. 1' },
  { id: 7, codigo: 'L-01', nombre: 'L-01 - Línea 1: Gómez Carrillo <-> Centro Cívico' },
  { id: 8, codigo: 'L-02', nombre: 'L-02 - Línea 2: San Sebastián <-> Jocotenango/Hipódromo' },
  { id: 9, codigo: 'L-06', nombre: 'L-06 - Línea 6: FEGUA <-> Proyectos 4-4' },
  { id: 10, codigo: 'L-07', nombre: 'L-07 - Línea 7: USAC Periférico <-> Parque Colón' },
  { id: 11, codigo: 'L-12', nombre: 'L-12 - Línea 12: CENTRA Sur <-> Plaza Barrios' },
  { id: 12, codigo: 'L-13', nombre: 'L-13 - Línea 13: Tipografía <-> Plaza Berlín/Hangares' },
  { id: 13, codigo: 'L-18', nombre: 'L-18 - Línea 18: FEGUA 18 Calle <-> CENTRA Atlántida' }
];

export default function FlotaParqueos({ buses = [], setBuses, pilotos = [], setPilotos, recargarDatos, API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {  const [busReasignarId, setBusReasignarId] = useState(buses[0]?.id_bus || 1);
  const [nuevoParqueoVal, setNuevoParqueoVal] = useState(3);
  const [msgReasignar, setMsgReasignar] = useState(null);

  const [numUnidad, setNumUnidad] = useState('');
  const [placaInput, setPlacaInput] = useState('');
  const [tipoUnidadSel, setTipoUnidadSel] = useState('ARTICULADO');
  const [capacidadSel, setCapacidadSel] = useState(160);
  const [lineaSelId, setLineaSelId] = useState(11);
  const [parqueoInicialSelId, setParqueoInicialSelId] = useState(3);
  const [msgRegistro, setMsgRegistro] = useState(null);

  const [filtroLineaBtn, setFiltroLineaBtn] = useState('TODAS');
  const [busquedaTexto, setBusquedaTexto] = useState('');

  // 1. CAMBIAR RUTA/LÍNEA
  const handleCambiarLinea = async (bus, nuevoCodigoLinea) => {
    const lineaObj = BASE_LINEAS.find(l => l.codigo === nuevoCodigoLinea);
    const idLineaNueva = lineaObj ? lineaObj.id : (bus.id_linea || 11);

    if (setBuses) {
      setBuses(prev => prev.map(b => (b.id_bus === bus.id_bus || b.id === bus.id) ? { ...b, linea: nuevoCodigoLinea, id_linea: idLineaNueva } : b));
    }

    try {
      await fetch(`${API_BASE_URL}/buses/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bus: bus.id_bus,
          numero_unidad: bus.id || bus.numero_unidad,
          id_linea: idLineaNueva,
          codigo_linea: nuevoCodigoLinea,
          estado: bus.estado
        })
      });
      if (recargarDatos) recargarDatos();
    } catch (err) {
      console.error('Error guardando linea en BD:', err);
    }
  };

  // 2. CAMBIAR ESTADO
  const handleCambiarEstado = async (bus, nuevoEstado) => {
    if (setBuses) {
      setBuses(prev => prev.map(b => (b.id_bus === bus.id_bus || b.id === bus.id) ? { ...b, estado: nuevoEstado } : b));
    }

    try {
      await fetch(`${API_BASE_URL}/buses/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bus: bus.id_bus,
          numero_unidad: bus.id || bus.numero_unidad,
          id_linea: bus.id_linea,
          codigo_linea: bus.linea,
          estado: nuevoEstado
        })
      });
      if (recargarDatos) recargarDatos();
    } catch (err) {
      console.error('Error guardando estado en BD:', err);
    }
  };

  // 3. ASIGNAR PILOTO
  const handleCambiarPiloto = async (busIdSql, busNumeroUnidad, nuevoIdPiloto) => {
    const idPilotoVal = (nuevoIdPiloto === 'Sin Asignar' || !nuevoIdPiloto) ? null : parseInt(nuevoIdPiloto);

    if (setPilotos) {
      setPilotos(prev => prev.map(p => {
        if (p.id_bus === busIdSql || p.busAsignado === busNumeroUnidad) {
          return { ...p, busAsignado: 'Sin Asignar', id_bus: null };
        }
        if (idPilotoVal && (p.id === idPilotoVal || p.id_piloto === idPilotoVal)) {
          return { ...p, busAsignado: busNumeroUnidad, id_bus: busIdSql };
        }
        return p;
      }));
    }

    try {
      await fetch(`${API_BASE_URL}/pilotos/asignar-bus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_piloto: idPilotoVal,
          id_bus: busIdSql,
          numero_unidad: busNumeroUnidad
        })
      });
      if (recargarDatos) recargarDatos();
    } catch (err) {
      console.error('Error asignando piloto en BD:', err);
    }
  };

  // REASIGNAR PARQUEO AUDITADO (REQ03)
  const handleReasignarParqueo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/buses/cambiar-parqueo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bus: parseInt(busReasignarId),
          nuevo_id_parqueo: parseInt(nuevoParqueoVal)
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setMsgReasignar({ tipo: 'exito', texto: `✅ ${data.mensaje}` });
        if (recargarDatos) recargarDatos();
      } else {
        setMsgReasignar({ tipo: 'error', texto: data.mensaje || 'Error reasignando parqueo.' });
      }
    } catch (err) {
      setMsgReasignar({ tipo: 'error', texto: 'No se pudo conectar con la API.' });
    }
  };

  // REGISTRAR UNIDAD
  const handleRegistrarBus = async (e) => {
    e.preventDefault();
    if (!numUnidad.trim() || !placaInput.trim()) {
      setMsgRegistro({ tipo: 'error', texto: 'Complete Número de Unidad y Placa.' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_unidad: numUnidad.trim().toUpperCase(),
          placa: placaInput.trim().toUpperCase(),
          tipo_unidad: tipoUnidadSel,
          capacidad_maxima: parseInt(capacidadSel),
          id_linea: parseInt(lineaSelId),
          id_parqueo: parseInt(parqueoInicialSelId)
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setMsgRegistro({ tipo: 'exito', texto: `✅ ${data.mensaje}` });
        setNumUnidad('');
        setPlacaInput('');
        if (recargarDatos) recargarDatos();
      } else {
        setMsgRegistro({ tipo: 'error', texto: data.mensaje || 'Error al guardar en BD' });
      }
    } catch (err) {
      setMsgRegistro({ tipo: 'error', texto: 'No se pudo conectar con la API de buses.' });
    }
  };

  const busesFiltrados = buses.filter((b) => {
    const busIdStr = (b.id || b.numero_unidad || '').toString().toLowerCase();
    const busPlacaStr = (b.placa || '').toString().toLowerCase();
    const busLineaStr = (b.linea || b.codigo_linea || '').toString();

    const coincideLinea = filtroLineaBtn === 'TODAS' || busLineaStr === filtroLineaBtn;
    const coincideTexto = busIdStr.includes(busquedaTexto.toLowerCase()) || 
                           busPlacaStr.includes(busquedaTexto.toLowerCase());
    return coincideLinea && coincideTexto;
  });

  return (
    <div className="space-y-6">

      {/* REQ03: REASIGNACIÓN AUDITADA DE PARQUEO */}
      <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100">
        <h3 className="font-extrabold text-slate-900 text-sm mb-1">REQ03: Reasignación Auditada de Parqueo</h3>
        <p className="text-xs text-gray-500 mb-4">Un bus no puede permanecer sin parqueo asignado.</p>

        <form onSubmit={handleReasignarParqueo} className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">BUS AFECTADO</label>
            <select
              value={busReasignarId}
              onChange={(e) => setBusReasignarId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-lime-500 cursor-pointer"
            >
              {buses.map((b) => (
                <option key={b.id_bus || b.id} value={b.id_bus || b.id}>
                  {b.id} ({b.placa}) — Parqueo actual: {b.parqueo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">NUEVO PARQUEO OBLIGATORIO</label>
            <select
              value={nuevoParqueoVal}
              onChange={(e) => setNuevoParqueoVal(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-lime-500 cursor-pointer"
            >
              {BASE_PARQUEOS.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-8 py-2.5 rounded-xl text-xs transition cursor-pointer">
            Reasignar Parqueo
          </button>
        </form>

        {msgReasignar && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-bold ${msgReasignar.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
            {msgReasignar.texto}
          </div>
        )}
      </div>

      {/* REGISTRO DE UNIDAD DE BUS */}
      <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100">
        <h3 className="font-extrabold text-slate-900 text-sm mb-4">Registro de Unidad de Bus</h3>
        <form onSubmit={handleRegistrarBus} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">NÚMERO UNIDAD</label>
              <input type="text" value={numUnidad} onChange={(e) => setNumUnidad(e.target.value)} placeholder="Ej: TM-105" className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PLACA</label>
              <input type="text" value={placaInput} onChange={(e) => setPlacaInput(e.target.value)} placeholder="Ej: C100JVX" className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">TIPO DE UNIDAD</label>
              <select 
                value={tipoUnidadSel} 
                onChange={(e) => {
                  setTipoUnidadSel(e.target.value);
                  setCapacidadSel(e.target.value === 'BIARTICULADO' ? 270 : e.target.value === 'CONVENCIONAL' ? 80 : 160);
                }} 
                className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-bold cursor-pointer"
              >
                <option value="ARTICULADO">Articulado (160 pax)</option>
                <option value="BIARTICULADO">Biarticulado (270 pax)</option>
                <option value="CONVENCIONAL">Padrón / Convencional (80 pax)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CAPACIDAD MÁXIMA</label>
              <input type="number" value={capacidadSel} readOnly className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-100 text-xs font-extrabold text-slate-600 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">LÍNEA ASIGNADA</label>
              <select value={lineaSelId} onChange={(e) => setLineaSelId(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-semibold cursor-pointer">
                {BASE_LINEAS.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PARQUEO INICIAL</label>
              <select value={parqueoInicialSelId} onChange={(e) => setParqueoInicialSelId(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-slate-50 text-xs font-semibold cursor-pointer">
                {BASE_PARQUEOS.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>

          {msgRegistro && (
            <div className={`p-3 rounded-xl text-xs font-bold ${msgRegistro.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              {msgRegistro.texto}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#84cc16] hover:bg-lime-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer">
              + Registrar en Flota
            </button>
          </div>
        </form>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-2xl shadow-2xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <input type="text" value={busquedaTexto} onChange={(e) => setBusquedaTexto(e.target.value)} placeholder="Buscar por placa o unidad..." className="w-full md:w-80 border border-gray-200 bg-slate-50 rounded-xl px-4 py-2 text-xs font-semibold" />
        <div className="flex gap-1.5 flex-wrap">
          {['TODAS', 'L-01', 'L-02', 'L-06', 'L-07', 'L-12', 'L-13', 'L-18', 'R-05', 'R-104', 'R-305', 'R-402', 'R-801', 'R-802'].map((lin) => (
            <button key={lin} onClick={() => setFiltroLineaBtn(lin)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filtroLineaBtn === lin ? 'bg-purple-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {lin}
            </button>
          ))}
        </div>
      </div>

      {/* TARJETAS DE BUSES CON PERSISTENCIA EN BD Y UI OPTIMISTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {busesFiltrados.map((bus) => {
          const busIdUnidad = bus.id || bus.numero_unidad;
          const pilotoAsignadoObj = pilotos.find(p => p.id_bus === bus.id_bus || p.busAsignado === busIdUnidad);
          const idPilotoActual = pilotoAsignadoObj ? (pilotoAsignadoObj.id || pilotoAsignadoObj.id_piloto) : 'Sin Asignar';

          return (
            <div key={bus.id_bus || busIdUnidad} className="bg-white border-l-4 border-l-purple-600 p-5 rounded-2xl shadow-2xs border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    
                    {/* 1. RUTA / LÍNEA EDITABLE */}
                    <select
                      value={bus.linea || 'L-12'}
                      onChange={(e) => handleCambiarLinea(bus, e.target.value)}
                      className="bg-purple-100 text-purple-900 border border-purple-300 font-black text-[10px] px-2 py-0.5 rounded cursor-pointer focus:outline-none hover:bg-purple-200 transition-colors"
                    >
                      {BASE_LINEAS.map((l) => (
                        <option key={l.id} value={l.codigo} className="bg-white text-slate-800">
                          {l.codigo}
                        </option>
                      ))}
                    </select>

                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{bus.tipo}</span>
                  </div>

                  {/* 2. ESTADO EDITABLE */}
                  <select
                    value={bus.estado || 'En espera'}
                    onChange={(e) => handleCambiarEstado(bus, e.target.value)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                      bus.estado === 'En ruta' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      bus.estado === 'En mantenimiento' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    <option value="En espera" className="bg-white text-slate-800">En espera</option>
                    <option value="En ruta" className="bg-white text-slate-800">En ruta</option>
                    <option value="En mantenimiento" className="bg-white text-slate-800">En mantenimiento</option>
                  </select>
                </div>

                <h3 className="text-xl font-black font-mono text-slate-900 tracking-tight">{bus.placa} ({busIdUnidad})</h3>
                
                {/* 3. PILOTO EDITABLE */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Piloto:</span>
                  <select
                    value={idPilotoActual}
                    onChange={(e) => handleCambiarPiloto(bus.id_bus, busIdUnidad, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                      idPilotoActual === 'Sin Asignar' 
                        ? 'bg-slate-50 text-slate-500 border-slate-200' 
                        : 'bg-lime-50 text-lime-800 border-lime-300 font-black'
                    }`}
                  >
                    <option value="Sin Asignar">Sin piloto asignado</option>
                    {pilotos.map((p) => {
                      const pId = p.id || p.id_piloto;
                      const pNom = p.nombre || p.nombre_completo;
                      return <option key={pId} value={pId}>{pNom}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-6 pt-3 border-t border-gray-100 space-y-1">
                <p>Capacidad: <strong className="text-slate-800">{bus.capacidad} pax</strong></p>
                <p>Patio / Parqueo: <strong className="text-slate-800">{bus.parqueo}</strong></p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}