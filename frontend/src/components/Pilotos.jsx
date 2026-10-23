import { useState } from 'react';

export default function Pilotos({ buses = [], setBuses, pilotos = [], setPilotos, recargarDatos, API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {  const [nombreInput, setNombreInput] = useState('');
  const [dpiInput, setDpiInput] = useState('');
  const [licenciaInput, setLicenciaInput] = useState('');
  const [tipoLicenciaSel, setTipoLicenciaSel] = useState('TIPO A');
  const [educativoInput, setEducativoInput] = useState('Universitario Incompleto, Curso Defensivo INTECAP');
  const [residenciaInput, setResidenciaInput] = useState('Zona 12, Ciudad de Guatemala');
  const [telefonoInput, setTelefonoInput] = useState('50001001');
  const [busInicialSel, setBusInicialSel] = useState('Sin Asignar');
  const [msgPiloto, setMsgPiloto] = useState(null);

  // Obtener lista de unidades ocupadas por OTROS pilotos
  const obtenerBusesDisponiblesParaPiloto = (pilotoActualId, busActualDelPiloto) => {
    const busesOcupadosPorOtros = pilotos
      .filter(p => (p.id || p.id_piloto) !== pilotoActualId)
      .map(p => p.busAsignado || p.numero_unidad)
      .filter(unidad => unidad && unidad !== 'Sin Asignar');

    return buses.filter(b => {
      const codigoUnidad = b.id || b.numero_unidad;
      // Disponible si NO está ocupado por otro piloto O si es el que ya tiene este piloto
      return !busesOcupadosPorOtros.includes(codigoUnidad) || codigoUnidad === busActualDelPiloto;
    });
  };

  // Buses disponibles para la creación de un nuevo piloto
  const busesOcupadosTodos = pilotos
    .map(p => p.busAsignado || p.numero_unidad)
    .filter(u => u && u !== 'Sin Asignar');
  const busesDisponiblesParaNuevo = buses.filter(b => !busesOcupadosTodos.includes(b.id || b.numero_unidad));

  // CAMBIAR O ASIGNAR BUS A PILOTO Y GUARDAR EN MYSQL
  const handleCambiarBusPiloto = async (pilotoIdSql, busNumeroUnidadNuevo) => {
    const busObj = buses.find(b => (b.id === busNumeroUnidadNuevo || b.numero_unidad === busNumeroUnidadNuevo));
    const busIdSql = busObj ? busObj.id_bus : null;

    // Actualización instantánea en la interfaz (UI Optimista)
    if (setPilotos) {
      setPilotos(prev => prev.map(p => {
        const idActual = p.id || p.id_piloto;
        if (idActual === pilotoIdSql) {
          return {
            ...p,
            busAsignado: busNumeroUnidadNuevo,
            numero_unidad: busNumeroUnidadNuevo,
            id_bus: busIdSql
          };
        }
        return p;
      }));
    }

    try {
      await fetch(`${API_BASE_URL}/pilotos/asignar-bus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_piloto: pilotoIdSql,
          id_bus: busIdSql,
          numero_unidad: busNumeroUnidadNuevo
        })
      });
      if (recargarDatos) recargarDatos();
    } catch (err) {
      console.error('Error al asignar bus al piloto en MySQL:', err);
    }
  };

  // REGISTRAR NUEVO PILOTO
  const handleRegistrarPiloto = async (e) => {
    e.preventDefault();
    if (!nombreInput.trim() || !dpiInput.trim()) {
      setMsgPiloto({ tipo: 'error', texto: 'Ingrese Nombre Completo y DPI obligatorio.' });
      return;
    }

    const busEncontrado = buses.find(b => b.id === busInicialSel || b.numero_unidad === busInicialSel);
    const idBusSql = busEncontrado ? busEncontrado.id_bus : null;

    try {
      const res = await fetch(`${API_BASE_URL}/pilotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombreInput.trim(),
          dpi: dpiInput.trim(),
          numero_licencia: licenciaInput.trim() || 'LIC-1001',
          tipo_licencia: tipoLicenciaSel,
          historial_educativo: educativoInput.trim(),
          direccion_residencia: residenciaInput.trim(),
          telefono: telefonoInput.trim(),
          correo: 'piloto@transmetro.gob.gt',
          id_bus: idBusSql
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setMsgPiloto({ tipo: 'exito', texto: `✅ ${data.mensaje || 'Piloto registrado exitosamente.'}` });
        setNombreInput('');
        setDpiInput('');
        setLicenciaInput('');
        setBusInicialSel('Sin Asignar');
        if (recargarDatos) recargarDatos();
      } else {
        setMsgPiloto({ tipo: 'error', texto: data.mensaje || 'Error al guardar en BD' });
      }
    } catch (err) {
      setMsgPiloto({ tipo: 'error', texto: 'No se pudo conectar con la API de pilotos.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* FORMULARIO DE REGISTRO */}
      <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-100">
        <h3 className="font-extrabold text-slate-900 text-sm mb-4">REQ04: Creación de Expediente Digital de Piloto</h3>
        
        <form onSubmit={handleRegistrarPiloto} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">NOMBRE COMPLETO</label>
              <input type="text" value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} placeholder="Ej: Carlos Méndez" className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CUI / DPI</label>
              <input type="text" value={dpiInput} onChange={(e) => setDpiInput(e.target.value)} placeholder="Ej: 1990100100101" className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">NÚMERO DE LICENCIA</label>
              <input type="text" value={licenciaInput} onChange={(e) => setLicenciaInput(e.target.value)} placeholder="Ej: LIC-1001" className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">TIPO LICENCIA</label>
              <select value={tipoLicenciaSel} onChange={(e) => setTipoLicenciaSel(e.target.value)} className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold cursor-pointer">
                <option value="TIPO A">Tipo A (Profesional)</option>
                <option value="TIPO B">Tipo B</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">HISTORIAL ACADÉMICO</label>
              <input type="text" value={educativoInput} onChange={(e) => setEducativoInput(e.target.value)} className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">DIRECCIÓN RESIDENCIA</label>
              <input type="text" value={residenciaInput} onChange={(e) => setResidenciaInput(e.target.value)} className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">TELÉFONO</label>
              <input type="text" value={telefonoInput} onChange={(e) => setTelefonoInput(e.target.value)} className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold" />
            </div>
            
            {/* SELECTOR BUS SOLO LIBRES */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ASIGNAR BUS</label>
              <select value={busInicialSel} onChange={(e) => setBusInicialSel(e.target.value)} className="w-full border border-gray-200 bg-slate-50 rounded-xl p-2.5 text-xs font-semibold cursor-pointer">
                <option value="Sin Asignar">-- Sin Asignar --</option>
                {busesDisponiblesParaNuevo.map(b => (
                  <option key={b.id || b.id_bus} value={b.id || b.numero_unidad}>
                    {b.id || b.numero_unidad} ({b.placa})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {msgPiloto && (
            <div className={`p-3 rounded-xl text-xs font-bold ${msgPiloto.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              {msgPiloto.texto}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs transition cursor-pointer">
              Registrar Piloto
            </button>
          </div>
        </form>
      </div>

      {/* TABLA DE PILOTOS CON ASIGNACIÓN DE BUS EXCLUSIVA Y PERSISTENTE */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-gray-100">
              <th className="py-3 px-4">NOMBRE COMPLETO</th>
              <th className="py-3 px-4">DPI</th>
              <th className="py-3 px-4">LICENCIA</th>
              <th className="py-3 px-4">HISTORIAL EDUCATIVO</th>
              <th className="py-3 px-4">RESIDENCIA</th>
              <th className="py-3 px-4">BUS ASIGNADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pilotos.map((p) => {
              const pNombre = p.nombre || p.nombre_completo || 'Sin nombre';
              const pDpi = p.dpi || '';
              const pLicencia = p.licencia || p.numero_licencia || 'TIPO A';
              const pEducativo = p.educativo || p.historial_educativo || 'Diversificado completo';
              const pResidencia = p.residencia || p.direccion_residencia || 'Zona 12, Guatemala';
              const pBus = p.busAsignado || p.numero_unidad || 'Sin Asignar';
              const idPilotoSql = p.id || p.id_piloto;

              // Filtrar únicamente los buses disponibles para ESTE piloto en particular
              const busesOpcion = obtenerBusesDisponiblesParaPiloto(idPilotoSql, pBus);

              return (
                <tr key={idPilotoSql} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{pNombre}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{pDpi}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{pLicencia}</td>
                  <td className="py-3.5 px-4 text-slate-600">{pEducativo}</td>
                  <td className="py-3.5 px-4 text-slate-600">{pResidencia}</td>
                  <td className="py-3.5 px-4">
                    {/* SELECTOR INTERACTIVO EN LA TABLA */}
                    <select
                      value={pBus}
                      onChange={(e) => handleCambiarBusPiloto(idPilotoSql, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
                        pBus === 'Sin Asignar' 
                          ? 'bg-slate-100 text-slate-600 border-slate-200' 
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                      }`}
                    >
                      <option value="Sin Asignar">Sin Asignar</option>
                      {busesOpcion.map((b) => {
                        const codUnidad = b.id || b.numero_unidad;
                        return (
                          <option key={b.id_bus || codUnidad} value={codUnidad}>
                            {codUnidad} ({b.placa})
                          </option>
                        );
                      })}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}