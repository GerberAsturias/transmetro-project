import { useState, useEffect } from 'react';

// CATÁLOGO BASE DE ESTACIONES
const ESTACIONES_DEFAULT = [
  { id_estacion: 1, nombre_estacion: 'CENTRA Sur (Patio Central Sur)', tipo_estacion: 'CENTRAL_TRANSFERENCIA', capacidad_maxima: 500, aforo_actual: 20 },
  { id_estacion: 4, nombre_estacion: 'Las Charcas (L-12)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 100 },
  { id_estacion: 5, nombre_estacion: 'El Carmen (L-12)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 85 },
  { id_estacion: 8, nombre_estacion: 'Trébol (L-12/L-07)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 400, aforo_actual: 320 },
  { id_estacion: 15, nombre_estacion: 'Plaza Barrios (Cabecera L-12)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 110 },
  { id_estacion: 601, nombre_estacion: 'FEGUA 18 Calle (Cabecera L-06/18)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 130 },
  { id_estacion: 1810, nombre_estacion: 'CENTRA Atlántida (Patio Central Norte)', tipo_estacion: 'CENTRAL_TRANSFERENCIA', capacidad_maxima: 450, aforo_actual: 95 },
  { id_estacion: 602, nombre_estacion: 'Parque Colón (Cabecera L-07)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 90 },
  { id_estacion: 502, nombre_estacion: 'Totem: Puente Penitenciaría (Z.4)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 20 },
  { id_estacion: 1041, nombre_estacion: 'Totem: Barrio San Antonio (Z.6)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 40 }
];

export default function InfraestructuraAforo({ API_BASE_URL = 'http://localhost:5000/api' }) {
  const [estaciones, setEstaciones] = useState(ESTACIONES_DEFAULT);
  const [estacionSelId, setEstacionSelId] = useState(1); // Default ID 1 (CENTRA Sur)
  
  // FLUJO DE PASAJEROS
  const [entranInput, setEntranInput] = useState(30);
  const [salenInput, setSalenInput] = useState(10);
  
  const [cargando, setCargando] = useState(false);
  const [evaluando, setEvaluando] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState(null);

  // CARGAR ESTACIONES DESDE MYSQL SIN SOBREESCRIBIR VALORES EN USO
  const cargarEstacionesBD = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/estaciones`);
      const data = await res.json();

      if (res.ok && data.status === 'EXITO' && Array.isArray(data.estaciones) && data.estaciones.length > 0) {
        setEstaciones(data.estaciones);
      }
    } catch (err) {
      console.warn('Usando estado local:', err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstacionesBD();
  }, []);

  const idSelNum = Number(estacionSelId);
  const estacionActiva = estaciones.find(e => Number(e.id_estacion) === idSelNum) || estaciones[0];

  // PROCESAR FLUJO EXCLUSIVO PARA LA ESTACIÓN SELECCIONADA
  const handleProcesarFlujo = async (e) => {
    e.preventDefault();
    if (!estacionActiva) return;

    setEvaluando(true);
    setMensajeNotificacion(null);

    const targetId = Number(estacionActiva.id_estacion);
    const numEntran = Math.max(0, parseInt(entranInput, 10) || 0);
    const numSalen = Math.max(0, parseInt(salenInput, 10) || 0);

    const aforoPrevio = parseInt(estacionActiva.aforo_actual, 10) || 0;
    const nuevoAforoCalculado = Math.max(0, aforoPrevio + numEntran - numSalen);

    try {
      const res = await fetch(`${API_BASE_URL}/estaciones/aforo/actualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estacion: targetId,
          entran: numEntran,
          salen: numSalen
        })
      });

      const data = await res.json();
      const nuevoAforoFinal = (res.ok && data.status === 'EXITO') ? data.estacion.nuevo_aforo : nuevoAforoCalculado;

      // ACTUALIZAR ÚNICAMENTE LA ESTACIÓN OBJETIVO EN EL ESTADO
      setEstaciones(prevEstaciones => prevEstaciones.map(est => {
        if (Number(est.id_estacion) === targetId) {
          return { ...est, aforo_actual: nuevoAforoFinal };
        }
        return est;
      }));

      const capMax = parseInt(estacionActiva.capacidad_maxima, 10) || 200;
      const porc = Math.round((nuevoAforoFinal / capMax) * 100);
      const esSobredemanda = porc >= 150;

      setMensajeNotificacion({
        tipo: esSobredemanda ? 'error' : 'exito',
        texto: esSobredemanda
          ? `🚨 ¡ALERTA SOBREDEMANDA (≥150%)! ${estacionActiva.nombre_estacion} alcanzó ${nuevoAforoFinal} pax (${porc}%).`
          : `✅ ${estacionActiva.nombre_estacion} actualizada: ${nuevoAforoFinal} pax (${porc}% de aforo).`
      });

      setEntranInput(15);
      setSalenInput(10);
    } catch (err) {
      console.error('Error al actualizar aforo:', err);
      
      // FALLBACK LOCAL: MODIFICA ÚNICAMENTE LA ESTACIÓN ACTIVA
      setEstaciones(prevEstaciones => prevEstaciones.map(est => {
        if (Number(est.id_estacion) === targetId) {
          return { ...est, aforo_actual: nuevoAforoCalculado };
        }
        return est;
      }));

      const capMax = parseInt(estacionActiva.capacidad_maxima, 10) || 200;
      const porc = Math.round((nuevoAforoCalculado / capMax) * 100);

      setMensajeNotificacion({
        tipo: porc >= 150 ? 'error' : 'exito',
        texto: `Aforo local de ${estacionActiva.nombre_estacion}: ${nuevoAforoCalculado} pax (${porc}%)`
      });
    } finally {
      setEvaluando(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* PANEL DE EVALUACIÓN Y CONTROL DE FLUJO DE PASAJEROS */}
      <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100">
        <div className="mb-4">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            REQ05: Evaluador de Aforo Crítico (Regla ≥ 150%)
          </h3>
          <p className="text-xs text-gray-500">
            Simula el flujo en tiempo real (pasajeros que ingresan al andén y pasajeros que se retiran) actualizando la estación seleccionada en MySQL.
          </p>
        </div>

        <form onSubmit={handleProcesarFlujo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* SELECTOR DE ESTACIÓN */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                SELECCIONAR ESTACIÓN
              </label>
              <select
                value={estacionSelId}
                onChange={(e) => {
                  setEstacionSelId(Number(e.target.value));
                  setMensajeNotificacion(null);
                }}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-lime-500 cursor-pointer"
              >
                {estaciones.map((e) => (
                  <option key={e.id_estacion} value={e.id_estacion}>
                    {e.nombre_estacion} (Cap: {e.capacidad_maxima} pax) — Actual: {e.aforo_actual || 0} pax
                  </option>
                ))}
              </select>
            </div>

            {/* PERSONAS QUE INGRESAN / LLEGAN */}
            <div>
              <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">
                👥 ENTRAN / LLEGAN AL ANDÉN
              </label>
              <input
                type="number"
                min="0"
                value={entranInput}
                onChange={(e) => setEntranInput(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              />
            </div>

            {/* PERSONAS QUE SALEN / ABORDAN */}
            <div>
              <label className="block text-[10px] font-bold text-rose-600 uppercase mb-1">
                🚌 SALEN / ABORDAN BUS
              </label>
              <input
                type="number"
                min="0"
                value={salenInput}
                onChange={(e) => setSalenInput(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              />
            </div>

          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-xs font-bold text-slate-700">
              Aforo actual en <span className="text-purple-700">{estacionActiva?.nombre_estacion}:</span>{' '}
              <span className="font-mono text-slate-950 font-black">{estacionActiva?.aforo_actual || 0} pax</span>
            </div>

            <button
              type="submit"
              disabled={evaluando}
              className="bg-[#84cc16] hover:bg-lime-600 active:bg-lime-700 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {evaluando ? 'Procesando...' : '⚡ Actualizar Aforo en MySQL'}
            </button>
          </div>
        </form>

        {mensajeNotificacion && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-bold border ${
            mensajeNotificacion.tipo === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            {mensajeNotificacion.texto}
          </div>
        )}
      </div>

      {/* GRILLA DE TARJETAS CONECTADAS A MYSQL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cargando ? (
          <div className="col-span-2 text-center py-8 text-gray-400 text-xs font-bold">
            Cargando estado de estaciones desde MySQL...
          </div>
        ) : (
          estaciones.map((est) => {
            const capMax = parseInt(est.capacidad_maxima, 10) || 200;
            const aforo = parseInt(est.aforo_actual, 10) || 0;
            const porc = Math.round((aforo / capMax) * 100);
            const esSobredemanda = porc >= 150;
            const esSeleccionada = Number(est.id_estacion) === idSelNum;

            return (
              <div
                key={est.id_estacion}
                onClick={() => setEstacionSelId(Number(est.id_estacion))}
                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  esSeleccionada ? 'ring-2 ring-lime-500 border-lime-500' : 'border-gray-100 hover:border-gray-300'
                } ${esSobredemanda ? 'bg-rose-50/30 border-rose-300' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {est.nombre_estacion}
                    </h4>
                    <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-1">
                      {est.tipo_estacion || 'ESTACION_INTERMEDIA'}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    esSobredemanda
                      ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {esSobredemanda ? '🚨 SOBREDEMANDA' : 'NORMAL'}
                  </span>
                </div>

                {/* BARRA DE PROGRESO */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-500">Aforo en Andén:</span>
                    <span className={`font-mono ${esSobredemanda ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
                      {aforo} / {capMax} pax ({porc}%)
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        esSobredemanda
                          ? 'bg-rose-500'
                          : porc >= 80
                          ? 'bg-amber-500'
                          : 'bg-[#84cc16]'
                      }`}
                      style={{ width: `${Math.min(porc, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}