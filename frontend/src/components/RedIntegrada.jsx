import { useState } from 'react';

// Base de datos completa con kilometrajes y paradas reales de la red
const BASE_RED_INTEGRADA_COMPLETA = [
  { sistema: 'TUBUS', codigo: 'R-05', ruta: 'Ruta 5: Parque Colón <-> Puente Penitenciaría', horarioLV: '5:30 a 19:00 hrs.', horarioFinSemana: '6:00 a 18:00 hrs.', puntos: 2, km: 3.60 },
  { sistema: 'TUBUS', codigo: 'R-104', ruta: 'Ruta 104: Barrio San Antonio <-> Cantón Victoria', horarioLV: '5:30 a 19:00 hrs.', horarioFinSemana: '6:00 a 18:00 hrs.', puntos: 2, km: 4.10 },
  { sistema: 'TUBUS', codigo: 'R-305', ruta: 'Ruta 305: Bulevar Vista Hermosa <-> La Terminal', horarioLV: '5:30 a 19:00 hrs.', horarioFinSemana: '6:00 a 18:00 hrs.', puntos: 8, km: 6.50 },
  { sistema: 'TUBUS', codigo: 'R-402', ruta: 'Ruta 402: Colonia Santa Fe <-> Av. Petapa / Ave. Castellana', horarioLV: '5:30 a 19:00 hrs.', horarioFinSemana: '6:00 a 18:00 hrs.', puntos: 6, km: 5.20 },
  { sistema: 'TUBUS', codigo: 'R-801', ruta: 'Ruta 801: Bethania/Los Pinos <-> La Terminal', horarioLV: '5:30 a 19:00 hrs.', horarioFinSemana: '6:00 a 18:00 hrs.', puntos: 2, km: 3.80 },
  { sistema: 'TUBUS', codigo: 'R-802', ruta: 'Ruta 802: El Amparo <-> Ave y 19 Calle Z. 1', horarioLV: '5:30 a 19:00 hrs.', horarioFinSemana: '6:00 a 18:00 hrs.', puntos: 7, km: 7.10 },
  { sistema: 'TRANSMETRO', codigo: 'L-01', ruta: 'Línea 1: Gómez Carrillo <-> Centro Cívico', horarioLV: '5:00 a 20:00 hrs.', horarioFinSemana: '5:00 a 19:00 hrs.', puntos: 2, km: 1.40 },
  { sistema: 'TRANSMETRO', codigo: 'L-02', ruta: 'Línea 2: San Sebastián <-> Jocotenango/Hipódromo', horarioLV: '5:30 a 20:00 hrs.', horarioFinSemana: '5:30 a 19:00 hrs.', puntos: 4, km: 3.20 },
  { sistema: 'TRANSMETRO', codigo: 'L-06', ruta: 'Línea 6: FEGUA <-> Proyectos 4-4', horarioLV: '5:00 a 21:00 hrs.', horarioFinSemana: '5:00 a 20:00 hrs.', puntos: 14, km: 9.50 },
  { sistema: 'TRANSMETRO', codigo: 'L-07', ruta: 'Línea 7: USAC Periférico <-> Parque Colón', horarioLV: '5:00 a 21:00 hrs.', horarioFinSemana: '5:00 a 20:00 hrs.', puntos: 12, km: 8.00 },
  { sistema: 'TRANSMETRO', codigo: 'L-12', ruta: 'Línea 12: CENTRA Sur <-> Plaza Barrios', horarioLV: '4:30 a 21:00 hrs.', horarioFinSemana: '4:30 a 21:00 hrs.', puntos: 15, km: 13.00 },
  { sistema: 'TRANSMETRO', codigo: 'L-13', ruta: 'Línea 13: Tipografía <-> Plaza Berlín/Hangares', horarioLV: '5:00 a 21:00 hrs.', horarioFinSemana: '5:00 a 20:00 hrs.', puntos: 9, km: 6.80 },
  { sistema: 'TRANSMETRO', codigo: 'L-18', ruta: 'Línea 18: FEGUA 18 Calle <-> CENTRA Atlántida', horarioLV: '5:00 a 21:00 hrs.', horarioFinSemana: '5:00 a 20:00 hrs.', puntos: 10, km: 5.20 }
];

export default function RedIntegrada() {
  const [rutas] = useState(BASE_RED_INTEGRADA_COMPLETA);

  // Cálculos consolidados para resumen de red
  const totalKm = rutas.reduce((acc, curr) => acc + curr.km, 0).toFixed(2);
  const totalPuntos = rutas.reduce((acc, curr) => acc + curr.puntos, 0);

  return (
    <div className="space-y-4">
      {/* TARJETAS RESUMEN DE COBERURA DE RED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL DE RUTAS</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{rutas.length} Rutas</p>
          <p className="text-xs text-gray-500 mt-0.5">7 Transmetro • 6 TuBus</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">COBERURA TOTAL RECORRIDA</p>
          <p className="text-2xl font-black text-lime-700 font-mono mt-1">{totalKm} km</p>
          <p className="text-xs text-gray-500 mt-0.5">Red vial integrada en operación</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ESTACIONES Y PUNTOS</p>
          <p className="text-2xl font-black text-purple-800 mt-1">{totalPuntos} Paradas</p>
          <p className="text-xs text-gray-500 mt-0.5">Puntos de abordaje habilitados</p>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE LA RED INTEGRADA */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Red Integrada: TRANSMETRO (BRT) & TUBUS (Alimentadores)
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full">
            13 Líneas Activas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold border-b border-gray-100">
                <th className="py-3.5 px-4">SISTEMA</th>
                <th className="py-3.5 px-4">CÓDIGO</th>
                <th className="py-3.5 px-4">LÍNEA / RUTA</th>
                <th className="py-3.5 px-4">HORARIO L-V</th>
                <th className="py-3.5 px-4">FIN DE SEMANA</th>
                <th className="py-3.5 px-4">ESTACIONES / PUNTOS</th>
                <th className="py-3.5 px-4 text-right">RECORRIDO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rutas.map((item) => (
                <tr key={item.codigo} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      item.sistema === 'TUBUS' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {item.sistema}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono text-slate-900">{item.codigo}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.ruta}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.horarioLV}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.horarioFinSemana}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {item.puntos} paradas/puntos
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-lime-700">
                    {item.km.toFixed(2)} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}