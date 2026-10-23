import { useState } from 'react';

export default function TarjetasRFID({ tarjetas = [], setTarjetas, recargarDatos, API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {  const [rfidInput, setRfidInput] = useState('');
  const [titularInput, setTitularInput] = useState('');
  const [tipoBeneficioSel, setTipoBeneficioSel] = useState('VECINO');
  const [saldoInicialInput, setSaldoInicialInput] = useState('20.00');
  const [msgEmision, setMsgEmision] = useState(null);

  const [filtroTipoBtn, setFiltroTipoBtn] = useState('TODOS');
  const [busquedaTexto, setBusquedaTexto] = useState('');

  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(tarjetas[0] || null);
  const [montoRecargaInput, setMontoRecargaInput] = useState('20.00');
  const [msgRecarga, setMsgRecarga] = useState(null);

  // 1. EMITIR Y GUARDAR NUEVA TARJETA EN MYSQL
  const handleEmitirTarjeta = async (e) => {
    e.preventDefault();
    if (!titularInput.trim()) {
      setMsgEmision({ tipo: 'error', texto: 'Ingrese el nombre del titular de la tarjeta.' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/tarjetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_rfid: rfidInput.trim(),
          titular: titularInput.trim(),
          tipo_tarjeta: tipoBeneficioSel,
          saldo: parseFloat(saldoInicialInput) || 20.0
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setMsgEmision({ tipo: 'exito', texto: `✅ ${data.mensaje}` });
        setRfidInput('');
        setTitularInput('');
        setSaldoInicialInput('20.00');
        if (recargarDatos) recargarDatos();
      } else {
        setMsgEmision({ tipo: 'error', texto: data.mensaje || 'Error al emitir tarjeta.' });
      }
    } catch (err) {
      setMsgEmision({ tipo: 'error', texto: 'No se pudo conectar con el servidor Express.' });
    }
  };

  // 2. RECARGAR SALDO EN MYSQL
  const handleRecargarSaldo = async (e) => {
    e.preventDefault();
    if (!tarjetaSeleccionada) {
      setMsgRecarga({ tipo: 'error', texto: 'Seleccione primero una tarjeta de la lista.' });
      return;
    }

    const montoVal = parseFloat(montoRecargaInput);
    if (!montoVal || montoVal <= 0) {
      setMsgRecarga({ tipo: 'error', texto: 'Ingrese un monto válido a recargar.' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/kiosco/recargar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_rfid: tarjetaSeleccionada.id || tarjetaSeleccionada.codigo_rfid,
          id_estacion: 1,
          monto: montoVal
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setMsgRecarga({ tipo: 'exito', texto: `✅ ${data.mensaje}` });
        
        // Actualizar el valor en la tarjeta seleccionada en tiempo real
        const nuevoSaldoCalculado = (parseFloat(tarjetaSeleccionada.saldo) + montoVal).toFixed(2);
        setTarjetaSeleccionada({ ...tarjetaSeleccionada, saldo: nuevoSaldoCalculado });

        if (recargarDatos) recargarDatos();
      } else {
        setMsgRecarga({ tipo: 'error', texto: data.mensaje || 'Error al procesar recarga.' });
      }
    } catch (err) {
      setMsgRecarga({ tipo: 'error', texto: 'No se pudo conectar con el kiosco de recarga.' });
    }
  };

  // Filtrar tarjetas registradas
  const tarjetasFiltradas = tarjetas.filter((t) => {
    const codStr = (t.id || t.codigo_rfid || '').toLowerCase();
    const titularStr = (t.titular || '').toLowerCase();
    const tipoStr = (t.tipo || t.tipo_tarjeta || 'VECINO').toUpperCase();

    const coincideTipo = filtroTipoBtn === 'TODOS' || tipoStr === filtroTipoBtn;
    const coincideTexto = codStr.includes(busquedaTexto.toLowerCase()) || titularStr.includes(busquedaTexto.toLowerCase());

    return coincideTipo && coincideTexto;
  });

  const tarjetaActivaVisual = tarjetaSeleccionada || tarjetasFiltradas[0] || {
    id: 'TC-88990011',
    titular: 'Evelyn Ramírez',
    tipo: 'VECINO',
    saldo: 25.00
  };

  return (
    <div className="space-y-6">

      {/* FORMULARIO DE EMISIÓN Y REGISTRO DE TARJETA */}
      <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100">
        <h3 className="font-extrabold text-slate-900 text-sm mb-1">Emisión y Registro de Tarjeta Ciudadana (RFID)</h3>
        <p className="text-xs text-gray-500 mb-4">Asigne un plástico RFID a un ciudadano vecino, adulto mayor o persona con discapacidad.</p>

        <form onSubmit={handleEmitirTarjeta} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CÓDIGO RFID (OPCIONAL)</label>
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Ej: TC-88990033 (Auto)"
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">NOMBRE DEL TITULAR</label>
              <input
                type="text"
                value={titularInput}
                onChange={(e) => setTitularInput(e.target.value)}
                placeholder="Ej: Ana María López"
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-lime-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">TIPO DE BENEFICIO</label>
              <select
                value={tipoBeneficioSel}
                onChange={(e) => setTipoBeneficioSel(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="VECINO">VECINO</option>
                <option value="ADULTO_MAYOR">ADULTO MAYOR</option>
                <option value="DISCAPACIDAD">DISCAPACIDAD</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">SALDO INICIAL (Q)</label>
              <input
                type="number"
                step="0.50"
                value={saldoInicialInput}
                onChange={(e) => setSaldoInicialInput(e.target.value)}
                className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>

          {msgEmision && (
            <div className={`p-3 rounded-xl text-xs font-bold ${msgEmision.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              {msgEmision.texto}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#84cc16] hover:bg-lime-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
            >
              + Emitir Tarjeta
            </button>
          </div>
        </form>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-2xl shadow-2xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          value={busquedaTexto}
          onChange={(e) => setBusquedaTexto(e.target.value)}
          placeholder="Buscar tarjeta o titular..."
          className="w-full md:w-80 border border-gray-200 bg-slate-50 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-lime-500"
        />

        <div className="flex gap-2">
          {['TODOS', 'VECINO', 'ADULTO_MAYOR', 'DISCAPACIDAD'].map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipoBtn(t)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                filtroTipoBtn === t
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: LISTA Y VISUALIZADOR DE PLÁSTICO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LISTADO DE TARJETAS REGISTRADAS */}
        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-extrabold text-slate-900 text-sm">
              Tarjetas Registradas ({tarjetasFiltradas.length})
            </h4>
            <span className="text-[10px] text-gray-400 font-medium">Selecciona para ver plástico y recargar</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {tarjetasFiltradas.map((t) => {
              const codRfid = t.id || t.codigo_rfid;
              const esSeleccionada = (tarjetaActivaVisual.id || tarjetaActivaVisual.codigo_rfid) === codRfid;

              return (
                <div
                  key={codRfid}
                  onClick={() => {
                    setTarjetaSeleccionada(t);
                    setMsgRecarga(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    esSeleccionada
                      ? 'border-lime-500 bg-lime-50/50 shadow-2xs'
                      : 'border-gray-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-md font-mono">
                      RFID
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 font-mono">{codRfid}</h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t.titular} ({t.tipo || t.tipo_tarjeta})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm">
                      Q{parseFloat(t.saldo || 0).toFixed(2)}
                    </p>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                      {t.estado || 'ACTIVA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VISUALIZADOR DIGITAL DE TARJETA Y KIOSCO DE RECARGA */}
        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">
              TARJETA SELECCIONADA
            </span>

            {/* DISEÑO DEL PLÁSTICO CIUDADANO */}
            <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800 min-h-[200px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-extrabold tracking-widest text-lime-400 uppercase">MUNICIPALIDAD DE GUATEMALA</p>
                  <h3 className="text-lg font-black tracking-tight text-white">TARJETA CIUDADANA</h3>
                </div>
                <span className="bg-[#84cc16] text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-md uppercase">
                  {tarjetaActivaVisual.tipo || tarjetaActivaVisual.tipo_tarjeta || 'VECINO'}
                </span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300"></div>
                <div className="w-6 h-6 border-2 border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white/40 rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="font-mono text-sm font-black tracking-widest text-lime-400">
                    {tarjetaActivaVisual.id || tarjetaActivaVisual.codigo_rfid}
                  </p>
                  <p className="text-xs font-bold text-slate-300 mt-0.5">
                    {tarjetaActivaVisual.titular}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">SALDO DISPONIBLE</p>
                  <p className="text-xl font-black text-white font-mono">
                    Q{parseFloat(tarjetaActivaVisual.saldo || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KIOSCO DE RECARGA DE SALDO */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              KIOSCO DE RECARGA DE SALDO
            </h5>

            <form onSubmit={handleRecargarSaldo} className="flex gap-3">
              <input
                type="number"
                step="1.00"
                value={montoRecargaInput}
                onChange={(e) => setMontoRecargaInput(e.target.value)}
                placeholder="Monto en Q."
                className="flex-1 border border-gray-200 bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-lime-500"
              />

              <button
                type="submit"
                className="bg-[#84cc16] hover:bg-lime-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
              >
                + Recargar
              </button>
            </form>

            {msgRecarga && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-bold ${msgRecarga.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                {msgRecarga.texto}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}