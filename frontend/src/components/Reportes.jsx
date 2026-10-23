import { useState, useEffect } from 'react';

export default function Reportes({ API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {  const [reporteConsolidado, setReporteConsolidado] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reportes/consolidado`)
      .then((res) => res.json())
      .then((data) => {
        const rows = data.data || data;
        setReporteConsolidado(rows);
      })
      .catch((err) => console.error('Error al cargar reporte consolidado SQL:', err))
      .finally(() => setCargando(false));
  }, [API_BASE_URL]);

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h2 className="text-sm font-extrabold text-slate-900">
          Reporte Consolidado (Vista SQL 'vw_reporte_estaciones_lineas_buses')
        </h2>
        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ● Conectado a db_transmetro
        </span>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-gray-100">
              <th className="py-3 px-4">LÍNEA</th>
              <th className="py-3 px-4">MUNICIPALIDAD</th>
              <th className="py-3 px-4">ESTACIÓN</th>
              <th className="py-3 px-4">AFORO</th>
              <th className="py-3 px-4">BUS ASIGNADO</th>
              <th className="py-3 px-4">PARQUEO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400">Cargando reporte desde la base de datos...</td>
              </tr>
            ) : reporteConsolidado.map((row, idx) => {
              const busAsignado = row.bus_asignado || row.bus;
              const tieneBus = Boolean(busAsignado && busAsignado !== 'Sin bus');

              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-black font-mono text-slate-900">{row.codigo_linea || row.linea}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{row.nombre_municipalidad || row.muni}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{row.nombre_estacion || row.estacion}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {row.aforo_actual !== undefined ? `${row.aforo_actual}/${row.capacidad_estacion || 250} pax` : row.aforo}
                  </td>
                  
                  {/* TEXTO EN VERDE SI HAY BUS, ROJO SI ESTÁ SIN BUS */}
                  <td className="py-3 px-4">
                    {tieneBus ? (
                      <span className="font-black text-emerald-600">
                        {busAsignado}
                      </span>
                    ) : (
                      <span className="font-extrabold text-rose-600">
                        Sin bus
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-medium">{row.codigo_parqueo || row.parqueo || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}