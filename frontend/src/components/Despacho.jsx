import { useState, useEffect } from 'react';

export default function Despacho({ API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {  const [buses, setBuses] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  
  // Estado de la simulación
  const [busSelId, setBusSelId] = useState('');
  const [estacionActualIdx, setEstacionActualIdx] = useState(0);
  
  const [pasajerosEnBus, setPasajerosEnBus] = useState(20); // Inicial
  const [bajandoInput, setBajandoInput] = useState(5);
  const [subiendoInput, setSubiendoInput] = useState(15);
  const [esperaEstacionInput, setEsperaEstacionInput] = useState(80);

  const [procesando, setProcesando] = useState(false);
  const [resultadoUltimoPaso, setResultadoUltimoPaso] = useState(null);
  const [bitacoraRecorrido, setBitacoraRecorrido] = useState([]);

  // Cargar catálogos desde MySQL al iniciar
  useEffect(() => {
    const CargarCatalogos = async () => {
      try {
        const [resBuses, resEstaciones] = await Promise.all([
          fetch(`${API_BASE_URL}/buses`),
          fetch(`${API_BASE_URL}/estaciones`)
        ]);

        if (resBuses.ok) {
          const dataB = await resBuses.json();
          const rowsB = dataB.data || [];
          setBuses(rowsB);
          if (rowsB.length > 0) setBusSelId(rowsB[0].id_bus);
        }

        if (resEstaciones.ok) {
          const dataE = await resEstaciones.json();
          setEstaciones(dataE.data || []);
        }
      } catch (err) {
        console.error('Error cargando datos para simulación:', err);
      }
    };
    CargarCatalogos();
  }, [API_BASE_URL]);

  const busSeleccionado = buses.find(b => b.id_bus === parseInt(busSelId)) || buses[0];
  const estacionActual = estaciones[estacionActualIdx] || estaciones[0];

  // SIMULAR LLEGADA A LA ESTACIÓN Y MOVIMIENTO DE PASAJEROS
  const handleProcesarEstacion = async (e) => {
    if (e) e.preventDefault();
    if (!busSeleccionado || !estacionActual) return;

    setProcesando(true);

    try {
      const res = await fetch(`${API_BASE_URL}/simulacion/paso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bus: busSeleccionado.id_bus,
          id_estacion: estacionActual.id_estacion,
          pasajeros_a_bordo_anteriores: pasajerosEnBus,
          bajando: parseInt(bajandoInput) || 0,
          subiendo: parseInt(subiendoInput) || 0,
          pasajeros_en_espera_estacion: parseInt(esperaEstacionInput) || 0
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'EXITO') {
        const resObj = data.resultado;
        
        // Actualizar ocupación actual del bus para la siguiente estación
        setPasajerosEnBus(resObj.nueva_ocupacion_bus);
        setResultadoUltimoPaso(resObj);

        // Agregar a la bitácora visual del recorrido
        const nuevoRegistroLog = {
          hora: new Date().toLocaleTimeString(),
          estacionNombre: estacionActual.nombre_estacion,
          busUnidad: busSeleccionado.numero_unidad,
          bajaron: bajandoInput,
          subieron: subiendoInput,
          pasajerosEnBusFinal: resObj.nueva_ocupacion_bus,
          porcBus: resObj.porcentaje_bus,
          retencion: resObj.retencion_5min,
          esperaEstacion: resObj.pasajeros_espera_estacion,
          porcEstacion: resObj.porcentaje_estacion,
          sobredemanda: resObj.alerta_sobredemanda
        };

        setBitacoraRecorrido(prev => [nuevoRegistroLog, ...prev]);

        // Generar valores aleatorios coherentes para la siguiente estación
        setBajandoInput(Math.floor(Math.random() * (resObj.nueva_ocupacion_bus + 1)));
        setSubiendoInput(Math.floor(Math.random() * 40));
        setEsperaEstacionInput(Math.floor(Math.random() * 180));
      }
    } catch (err) {
      console.error('Error en simulación:', err);
    } finally {
      setProcesando(false);
    }
  };

  // Avanzar a la siguiente estación en la línea
  const handleAvanzarSiguienteEstacion = () => {
    if (estaciones.length === 0) return;
    const sigIdx = (estacionActualIdx + 1) % estaciones.length;
    setEstacionActualIdx(sigIdx);
    setResultadoUltimoPaso(null);
  };

  return (
    <div className="space-y-6">

      {/* CABECERA Y SELECCIÓN DE UNIDAD */}
      <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">Simulador en Tiempo Real de Recorrido de Bus</h3>
          <p className="text-xs text-gray-500">Evaluación dinámica de Subida/Bajada, Retención (&lt;25%) y Alerta de Sobredemanda (&ge;150%)</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <label className="text-xs font-bold text-gray-500 uppercase">UNIDAD DE BUS:</label>
          <select
            value={busSelId}
            onChange={(e) => {
              setBusSelId(e.target.value);
              setResultadoUltimoPaso(null);
            }}
            className="border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800 cursor-pointer"
          >
            {buses.map((b) => (
              <option key={b.id_bus} value={b.id_bus}>
                {b.numero_unidad} ({b.placa}) - Cap: {b.capacidad_maxima} pax
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PANEL PRINCIPAL DE LA ESTACIÓN ACTUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA 1: CONTROLES DE LA ESTACIÓN ACTUAL */}
        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              ESTACIÓN {estacionActualIdx + 1} DE {estaciones.length}
            </span>
            <button
              onClick={handleAvanzarSiguienteEstacion}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-200 transition cursor-pointer"
            >
              Siguiente Estación ➡️
            </button>
          </div>

          <h4 className="text-lg font-black text-slate-900">
            {estacionActual ? estacionActual.nombre_estacion : 'Cargando Estación...'}
          </h4>
          <p className="text-xs text-gray-500">Capacidad máx. estación: <strong>{estacionActual?.capacidad_maxima || 100} personas</strong></p>

          <form onSubmit={handleProcesarEstacion} className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
              <span className="font-bold text-gray-600">Pasajeros al llegar la unidad:</span>
              <span className="font-mono font-black text-slate-900 text-sm">{pasajerosEnBus} pax</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-rose-600 uppercase mb-1">⬇️ BAJAN DEL BUS</label>
                <input
                  type="number"
                  min="0"
                  max={pasajerosEnBus}
                  value={bajandoInput}
                  onChange={(e) => setBajandoInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">⬆️ SUBEN AL BUS</label>
                <input
                  type="number"
                  min="0"
                  value={subiendoInput}
                  onChange={(e) => setSubiendoInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1">👥 PASAJEROS EN ESPERA EN ESTACIÓN</label>
              <input
                type="number"
                min="0"
                value={esperaEstacionInput}
                onChange={(e) => setEsperaEstacionInput(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={procesando}
              className="w-full bg-[#84cc16] hover:bg-lime-600 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-2xs mt-2"
            >
              {procesando ? 'Evaluando...' : '⚡ Procesar Movimiento y Evaluar Reglas'}
            </button>
          </form>
        </div>

        {/* COLUMNA 2 Y 3: ESTADO Y ALERTAS REQL 04 Y REQL 15 */}
        <div className="lg:col-span-2 space-y-4">
          {resultadoUltimoPaso ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* EVALUACIÓN REQL 15: OCUPACIÓN MENOR A 25% */}
              <div className={`p-5 rounded-2xl border ${
                resultadoUltimoPaso.retencion_5min 
                  ? 'bg-amber-50 border-amber-300 text-amber-950' 
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">REQL 15: OCUPACIÓN DEL BUS</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    resultadoUltimoPaso.retencion_5min ? 'bg-amber-200 text-amber-900 border-amber-400' : 'bg-emerald-200 text-emerald-900 border-emerald-400'
                  }`}>
                    {resultadoUltimoPaso.porcentaje_bus}%
                  </span>
                </div>

                <h4 className="text-xl font-black font-mono">
                  {resultadoUltimoPaso.nueva_ocupacion_bus} / {resultadoUltimoPaso.capacidad_bus} pax
                </h4>

                <p className="text-xs font-medium mt-3 leading-relaxed">
                  {resultadoUltimoPaso.mensaje_retencion}
                </p>

                {resultadoUltimoPaso.retencion_5min && (
                  <div className="mt-3 bg-amber-200/60 p-2.5 rounded-xl border border-amber-300 text-[11px] font-bold flex items-center gap-2">
                    ⏱️ Cronómetro de Retención Activado: 05:00 min de espera.
                  </div>
                )}
              </div>

              {/* EVALUACIÓN REQL 04: AFORO Y SOBREDEMANDA DE ESTACIÓN (>= 150%) */}
              <div className={`p-5 rounded-2xl border ${
                resultadoUltimoPaso.alerta_sobredemanda 
                  ? 'bg-rose-50 border-rose-300 text-rose-950' 
                  : 'bg-blue-50 border-blue-300 text-blue-950'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">REQL 04: AFORO ESTACIÓN</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    resultadoUltimoPaso.alerta_sobredemanda ? 'bg-rose-200 text-rose-900 border-rose-400' : 'bg-blue-200 text-blue-900 border-blue-400'
                  }`}>
                    {resultadoUltimoPaso.porcentaje_estacion}%
                  </span>
                </div>

                <h4 className="text-xl font-black font-mono">
                  {resultadoUltimoPaso.pasajeros_espera_estacion} / {resultadoUltimoPaso.capacidad_estacion} pax en espera
                </h4>

                <p className="text-xs font-medium mt-3 leading-relaxed">
                  {resultadoUltimoPaso.mensaje_sobredemanda}
                </p>

                {resultadoUltimoPaso.alerta_sobredemanda && (
                  <div className="mt-3 bg-rose-200/70 p-2.5 rounded-xl border border-rose-300 text-[11px] font-black flex items-center gap-2 animate-pulse">
                    🚨 DESPACHAR BUS DE APOYO A ESTA ESTACIÓN
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400">
              <p className="text-xs font-semibold">Presiona <strong>"Procesar Movimiento"</strong> para simular el paso del bus por la estación actual.</p>
            </div>
          )}

          {/* BITÁCORA DEL RECORRIDO REGISTRADO EN MYSQL */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100">
            <h4 className="font-extrabold text-slate-900 text-xs mb-3">Historial del Recorrido (Bitácora de Auditoría en MySQL)</h4>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {bitacoraRecorrido.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">No hay registros en este recorrido aún.</p>
              ) : (
                bitacoraRecorrido.map((log, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400 mr-2">{log.hora}</span>
                      <strong className="text-slate-900">{log.estacionNombre}</strong>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Bajan: {log.bajaron} | Suben: {log.subieron} | Pasajeros a bordo: <strong className="text-slate-800">{log.pasajerosEnBusFinal}</strong> ({log.porcBus}%)
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      {log.retencion && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] px-2 py-0.5 rounded-md">
                          Retención 5m
                        </span>
                      )}
                      {log.sobredemanda && (
                        <span className="bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[9px] px-2 py-0.5 rounded-md">
                          Alerta 150%+
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}