import { useState, useEffect } from 'react';

export default function Bitacora({ API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // CARGAR HISTORIAL REAL DESDE MYSQL
  const cargarTransaccionesBD = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/transacciones`);
      const data = await res.json();

      if (res.ok && data.status === 'EXITO') {
        setTransacciones(data.data || []);
      } else {
        setError(data.mensaje || 'Ocurrió un error al consultar MySQL.');
      }
    } catch (err) {
      console.error('Error al conectar con la API de bitácora:', err);
      setError('No se pudo establecer conexión con el servidor Node.js.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTransaccionesBD();
  }, []);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const f = new Date(fechaStr);
      return f.toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-black text-slate-900 text-base">
            Bitácora de Transacciones SQA
          </h3>
          <p className="text-xs text-gray-500">
            Historial auditado de cobros de pasajes en molinetes y recargas en kioscos registrados en MySQL.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarTransaccionesBD}
          disabled={cargando}
          className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer border border-slate-200 disabled:opacity-50"
        >
          {cargando ? '⌛ Sincronizando...' : '🔄 Actualizar Bitácora'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 font-extrabold uppercase text-[10px]">
              <th className="py-3 px-2">ID</th>
              <th className="py-3 px-2">RFID</th>
              <th className="py-3 px-2">ESTACIÓN / ORIGEN</th>
              <th className="py-3 px-2">EVENTO</th>
              <th className="py-3 px-2">MONTO</th>
              <th className="py-3 px-2">FECHA Y HORA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-slate-800">
            {cargando ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400 font-bold">
                  Consultando registros de auditoría en la base de datos MySQL...
                </td>
              </tr>
            ) : transacciones.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400 italic font-bold">
                  No hay transacciones registradas aún en MySQL. Realiza un cobro en Molinete o una recarga en Tarjetas RFID para ver los registros.
                </td>
              </tr>
            ) : (
              transacciones.map((t) => {
                const esRecarga = t.tipo_transaccion === 'RECARGA_KIOSCO' || t.tipo_transaccion === 'RECARGA_SALDO';
                return (
                  <tr key={t.id_transaccion} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      #{t.id_transaccion}
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-700 font-bold">
                      {t.codigo_rfid || 'TC-SISTEMA'}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      {t.nombre_estacion || 'KIOSCO_VIRTUAL'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${
                        esRecarga
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}>
                        {t.tipo_transaccion || 'COBRO_PASAJE'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono font-black text-slate-900">
                      Q{parseFloat(t.monto || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-gray-500 font-mono text-[11px]">
                      {formatearFecha(t.fecha_hora)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}