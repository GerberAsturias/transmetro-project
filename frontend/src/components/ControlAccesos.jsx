import { useState, useEffect } from 'react';

export default function ControlAccesos({ usuarioSesion, API_BASE_URL = 'http://localhost:5000/api' }) {
  const [accesos, setAccesos] = useState([]);
  const [nombreGuardia, setNombreGuardia] = useState('');
  const [accesoSelId, setAccesoSelId] = useState('');
  const [turno, setTurno] = useState('DIURNO');
  
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(true);

  const esAdmin = usuarioSesion?.rol === 'ADMINISTRADOR';

  const cargarAccesos = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/accesos`);
      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setAccesos(data.data || []);
        if (data.data.length > 0 && !accesoSelId) {
          setAccesoSelId(data.data[0].id_acceso);
        }
      }
    } catch (err) {
      console.error('Error al cargar accesos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAccesos();
  }, []);

  const handleAgregarGuardia = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!esAdmin) {
      setMensaje({ tipo: 'error', texto: '⚠️ Solo el Administrador puede registrar o asignar guardias.' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/guardias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombreGuardia,
          id_acceso: accesoSelId,
          turno,
          rol_solicitante: usuarioSesion?.rol
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setMensaje({ tipo: 'exito', texto: '✅ Guardia asignado exitosamente.' });
        setNombreGuardia('');
        cargarAccesos();
      } else {
        setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al asignar guardia.' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PANEL REGISTRO DE GUARDIAS (RESTRINGIDO PARA OPERADOR) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">REQ10: Control de Accesos y Guardias de Seguridad</h3>
            <p className="text-xs text-gray-500">Cada acceso a estación debe contar con al menos 1 guardia activo.</p>
          </div>
          
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
            esAdmin ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-blue-100 text-blue-900 border-blue-300'
          }`}>
            ROL CONECTADO: {usuarioSesion?.rol || 'OPERADOR'}
          </span>
        </div>

        {esAdmin ? (
          <form onSubmit={handleAgregarGuardia} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">NOMBRE COMPLETO GUARDIA</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={nombreGuardia}
                onChange={(e) => setNombreGuardia(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ACCESO / ESTACIÓN</label>
              <select
                value={accesoSelId}
                onChange={(e) => setAccesoSelId(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                {accesos.map(a => (
                  <option key={a.id_acceso} value={a.id_acceso}>
                    {a.nombre_estacion} - {a.nombre_acceso} ({a.total_guardias} guardias)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">TURNO</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="DIURNO">DIURNO</option>
                <option value="NOCTURNO">NOCTURNO</option>
                <option value="MIXTOS">24 HORAS</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs transition cursor-pointer"
            >
              + Asignar Guardia
            </button>
          </form>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold">
            🔒 Modo Operador: Vista de monitoreo. La adición de guardias y creación de operadores está reservada al Administrador.
          </div>
        )}

        {mensaje && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-bold ${
            mensaje.tipo === 'error' ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
          }`}>
            {mensaje.texto}
          </div>
        )}
      </div>

      {/* TARJETAS DE EVALUACIÓN DE REGLA EN ACCESOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargando ? (
          <div className="col-span-3 text-center py-6 text-gray-400 text-xs font-bold">Cargando accesos...</div>
        ) : (
          accesos.map(a => {
            const cumple = a.total_guardias >= 1;
            return (
              <div key={a.id_acceso} className={`p-5 rounded-2xl border bg-white shadow-2xs ${
                cumple ? 'border-gray-100' : 'border-rose-300 bg-rose-50/20'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-extrabold text-slate-900 text-xs">{a.nombre_estacion}</h4>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    cumple ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                  }`}>
                    {cumple ? 'OK: REGLA CUMPLIDA' : '🚨 SIN GUARDIA'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{a.nombre_acceso}</p>
                <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-between items-center">
                  <span className="text-gray-400 font-bold">Guardias Asignados:</span>
                  <span className="font-mono font-black text-slate-900">{a.total_guardias}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}