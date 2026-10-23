import { useState, useEffect } from 'react';

export default function Molinete({ tarjetas = [], recargarDatos, API_BASE_URL = 'http://localhost:5000/api' }) {
  const [estaciones, setEstaciones] = useState([]);
  const [tarjetaSelCode, setTarjetaSelCode] = useState('');
  const [estacionSelId, setEstacionSelId] = useState('');
  const [montoTarifa, setMontoTarifa] = useState('2.00');

  const [procesando, setProcesando] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState(null);

  // Cargar estaciones reales desde MySQL al montar el componente
  useEffect(() => {
    const cargarEstacionesDB = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/estaciones`);
        if (res.ok) {
          const json = await res.json();
          const rows = json.data || [];
          setEstaciones(rows);
          if (rows.length > 0 && !estacionSelId) {
            setEstacionSelId(rows[0].id_estacion);
          }
        }
      } catch (err) {
        console.error('Error cargando estaciones desde MySQL:', err);
      }
    };
    cargarEstacionesDB();
  }, [API_BASE_URL]);

  // Asignar primer tarjeta automáticamente cuando carguen las tarjetas
  useEffect(() => {
    if (tarjetas.length > 0 && !tarjetaSelCode) {
      setTarjetaSelCode(tarjetas[0].id || tarjetas[0].codigo_rfid);
    }
  }, [tarjetas]);

  // PROCESAR EL PASAJE EN MYSQL
  const handleProcesarPasaje = async (e) => {
    e.preventDefault();
    setMensajeResultado(null);

    if (!tarjetaSelCode) {
      setMensajeResultado({ tipo: 'error', texto: 'Seleccione una tarjeta RFID válida.' });
      return;
    }

    if (!estacionSelId) {
      setMensajeResultado({ tipo: 'error', texto: 'Seleccione una estación de abordaje.' });
      return;
    }

    setProcesando(true);

    try {
      const res = await fetch(`${API_BASE_URL}/cobrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_rfid: tarjetaSelCode,
          id_estacion: parseInt(estacionSelId),
          monto: parseFloat(montoTarifa) || 2.00
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'EXITO') {
        setMensajeResultado({
          tipo: 'exito',
          texto: `✅ ${data.mensaje || 'Pasaje procesado con éxito.'}`
        });

        // Refrescar estaciones para ver el aforo incrementado
        const resEstaciones = await fetch(`${API_BASE_URL}/estaciones`);
        if (resEstaciones.ok) {
          const jsonEst = await resEstaciones.json();
          setEstaciones(jsonEst.data || []);
        }

        // Sincronizar estado global
        if (recargarDatos) recargarDatos();
      } else {
        setMensajeResultado({
          tipo: 'error',
          texto: `❌ ${data.mensaje || 'Error al procesar el cobro.'}`
        });
      }
    } catch (err) {
      setMensajeResultado({
        tipo: 'error',
        texto: '❌ Error de conexión con el backend Express (puerto 5000).'
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xs border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Validación de Pasaje y Cobro RFID</h3>
            <p className="text-xs text-gray-500 mt-1">Módulo de Cobro Digital en Estaciones</p>
          </div>
          <span className="bg-lime-100 text-lime-900 font-extrabold text-xs px-3 py-1.5 rounded-lg border border-lime-300">
            Tarifa: Q{parseFloat(montoTarifa).toFixed(2)}
          </span>
        </div>

        <form onSubmit={handleProcesarPasaje} className="space-y-5">
          {/* SELECCIÓN DE TARJETA */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              TARJETA RFID PRESENTADA
            </label>
            <select
              value={tarjetaSelCode}
              onChange={(e) => {
                setTarjetaSelCode(e.target.value);
                setMensajeResultado(null);
              }}
              className="w-full border border-gray-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-lime-500 cursor-pointer"
            >
              {tarjetas.map((t) => {
                const rfid = t.id || t.codigo_rfid;
                const saldoVal = parseFloat(t.saldo || 0).toFixed(2);
                return (
                  <option key={rfid} value={rfid}>
                    {rfid} — {t.titular} (Saldo: Q{saldoVal})
                  </option>
                );
              })}
            </select>
          </div>

          {/* SELECCIÓN DE ESTACIÓN */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              ESTACIÓN O TÓTEM DE ABORDAJE
            </label>
            <select
              value={estacionSelId}
              onChange={(e) => setEstacionSelId(e.target.value)}
              className="w-full border border-gray-200 bg-slate-50 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-lime-500 cursor-pointer"
            >
              {estaciones.length > 0 ? (
                estaciones.map((est) => (
                  <option key={est.id_estacion} value={est.id_estacion}>
                    {est.nombre_estacion} [{est.tipo_estacion}] (Aforo actual: {est.aforo_actual || 0} pax)
                  </option>
                ))
              ) : (
                <option value="1">FEGUA 18 Calle (Cabecera L-06/18) [ESTACION_CABECERA] (Aforo actual: 130 pax)</option>
              )}
            </select>
          </div>

          {/* MENSAJE DE RETROALIMENTACIÓN */}
          {mensajeResultado && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                mensajeResultado.tipo === 'exito'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {mensajeResultado.texto}
            </div>
          )}

          {/* BOTÓN DE ACCIÓN */}
          <button
            type="submit"
            disabled={procesando}
            className="w-full bg-[#84cc16] hover:bg-lime-600 disabled:bg-gray-300 text-slate-950 font-black py-3.5 rounded-xl text-xs transition cursor-pointer shadow-2xs mt-2"
          >
            {procesando ? 'Procesando Cobro...' : 'Procesar Pasaje'}
          </button>
        </form>
      </div>
    </div>
  );
}