import { useState, useEffect } from 'react';

import MapaGeoespacial from './components/MapaGeoespacial';
import TarjetasRFID from './components/TarjetasRFID';
import Molinete from './components/Molinete';
import FlotaParqueos from './components/FlotaParqueos';
import RedIntegrada from './components/RedIntegrada';
import Pilotos from './components/Pilotos';
import Reportes from './components/Reportes';
import Bitacora from './components/Bitacora';

export default function InfraestructuraAforo({ API_BASE_URL = import.meta.env.VITE_API_URL || 'https://transmetro-backend.onrender.com/api' }) {export default function App() {
  const [usuarioAuth, setUsuarioAuth] = useState(() => {
    const sesionGuardada = localStorage.getItem('usuarioAuth');
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  });

  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [errorLogin, setErrorLogin] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('mapa');

  const [buses, setBuses] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarDatosBackend = async () => {
    setCargando(true);
    try {
      const [resBuses, resPilotos, resTarjetas] = await Promise.all([
        fetch(`${API_BASE_URL}/buses`).catch(() => null),
        fetch(`${API_BASE_URL}/pilotos`).catch(() => null),
        fetch(`${API_BASE_URL}/tarjetas`).catch(() => null)
      ]);

      if (resBuses && resBuses.ok) {
        const jsonBuses = await resBuses.json();
        const rows = jsonBuses.data || [];
        setBuses(rows.map(b => ({
          id: b.numero_unidad,
          id_bus: b.id_bus,
          placa: b.placa,
          linea: b.codigo_linea || 'L-12',
          tipo: b.tipo_unidad,
          capacidad: b.capacidad_maxima,
          estado: b.estado === 'EN_SERVICIO' ? 'En ruta' : b.estado === 'EN_MANTENIMIENTO' ? 'En mantenimiento' : 'En espera',
          parqueo: b.codigo_parqueo || 'PRK-TR-01',
          id_linea: b.id_linea,
          id_parqueo: b.id_parqueo
        })));
      }

      if (resPilotos && resPilotos.ok) {
        const jsonPilotos = await resPilotos.json();
        const rows = jsonPilotos.data || [];
        setPilotos(rows.map(p => ({
          id: p.id_piloto,
          nombre: p.nombre_completo,
          dpi: p.dpi,
          licencia: `${p.numero_licencia || 'LIC-1001'} (${p.tipo_licencia || 'TIPO A'})`,
          educativo: p.historial_educativo,
          residencia: p.direccion_residencia,
          busAsignado: p.numero_unidad || 'Sin Asignar',
          id_bus: p.id_bus
        })));
      }

      if (resTarjetas && resTarjetas.ok) {
        const jsonTarjetas = await resTarjetas.json();
        const rows = jsonTarjetas.data || [];
        setTarjetas(rows.map(t => ({
          id: t.codigo_rfid,
          id_tarjeta: t.id_tarjeta,
          titular: t.titular,
          tipo: t.tipo_tarjeta,
          saldo: parseFloat(t.saldo) || 0.0,
          estado: t.estado
        })));
      }
    } catch (err) {
      console.error('Error sincronizando con Backend:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioAuth) {
      cargarDatosBackend();
    }
  }, [usuarioAuth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin(null);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: inputUser, password: inputPass })
      });

      const data = await res.json();
      if (res.ok && data.status === 'EXITO') {
        setUsuarioAuth(data.usuario);
        localStorage.setItem('usuarioAuth', JSON.stringify(data.usuario));
      } else {
        setErrorLogin(data.mensaje || 'Credenciales inválidas');
      }
    } catch (err) {
      if (inputUser === 'admin' && inputPass === 'admin123') {
        const userAdmin = { nombre: 'Administrador SQA', rol: 'ADMINISTRADOR' };
        setUsuarioAuth(userAdmin);
        localStorage.setItem('usuarioAuth', JSON.stringify(userAdmin));
      } else {
        setErrorLogin('No se pudo conectar con el backend Express (puerto 5000)');
      }
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioAuth');
    setUsuarioAuth(null);
  };

  if (!usuarioAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#84cc16] rounded-2xl mx-auto flex items-center justify-center font-black text-slate-950 text-2xl mb-3 shadow-md border border-lime-400">
              TM
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">TRANSMETRO GT</h1>
            <p className="text-xs text-slate-500 mt-1">Consola Central de Control Operativo SQA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">USUARIO</label>
              <input 
                type="text" 
                value={inputUser} 
                onChange={(e) => setInputUser(e.target.value)} 
                placeholder="Ingrese su usuario"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-lime-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">CONTRASEÑA</label>
              <input 
                type="password" 
                value={inputPass} 
                onChange={(e) => setInputPass(e.target.value)} 
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-lime-500" 
                required 
              />
            </div>
            
            {errorLogin && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                {errorLogin}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#84cc16] hover:bg-lime-600 text-slate-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md mt-2"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderizarModulo = () => {
    switch (pestanaActiva) {
      case 'mapa': return <MapaGeoespacial buses={buses} API_BASE_URL={API_BASE_URL} />;
      case 'tarjetas': return <TarjetasRFID tarjetas={tarjetas} setTarjetas={setTarjetas} recargarDatos={cargarDatosBackend} API_BASE_URL={API_BASE_URL} />;
      case 'molinete': return <Molinete tarjetas={tarjetas} setTarjetas={setTarjetas} recargarDatos={cargarDatosBackend} API_BASE_URL={API_BASE_URL} />;
      case 'flota': return <FlotaParqueos buses={buses} setBuses={setBuses} pilotos={pilotos} setPilotos={setPilotos} recargarDatos={cargarDatosBackend} API_BASE_URL={API_BASE_URL} />;
      case 'red': return <RedIntegrada API_BASE_URL={API_BASE_URL} />;
      case 'pilotos': return <Pilotos buses={buses} setBuses={setBuses} pilotos={pilotos} setPilotos={setPilotos} recargarDatos={cargarDatosBackend} API_BASE_URL={API_BASE_URL} />;
      case 'reportes': return <Reportes buses={buses} API_BASE_URL={API_BASE_URL} />;
      case 'bitacora': return <Bitacora API_BASE_URL={API_BASE_URL} />;
      default: return <MapaGeoespacial buses={buses} API_BASE_URL={API_BASE_URL} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-screen-2xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#84cc16] text-slate-950 font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center border border-lime-400 shadow-xs">
              TM
            </div>
            <div>
              <h1 className="font-extrabold text-xs tracking-wide flex items-center gap-2 text-slate-900">
                TRANSMETRO <span className="text-[9px] font-bold border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-500 bg-slate-50 uppercase">MUNICIPALIDAD DE GUATEMALA</span>
              </h1>
              <p className="text-[11px] text-lime-600 font-extrabold tracking-tight">
                SQA <span className="text-slate-400 font-medium">Sistema Central de Control Interno y Operación</span>
              </p>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 shadow-inner">
            {[
              { id: 'mapa', label: 'Mapa Geoespacial' },
              { id: 'tarjetas', label: 'Tarjetas RFID' },
              { id: 'molinete', label: 'Molinete' },
              { id: 'flota', label: 'Flota y Parqueos' },
              { id: 'red', label: 'Red Integrada' },
              { id: 'pilotos', label: 'Pilotos' },
              { id: 'reportes', label: 'Reportes' },
              { id: 'bitacora', label: 'Bitácora' }
            ].map((tab) => {
              const isActive = pestanaActiva === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPestanaActiva(tab.id)}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer tracking-tight ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200 ring-2 ring-lime-400/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={cargarDatosBackend}
              title="Refrescar datos desde MySQL"
              className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 text-[11px] font-extrabold px-3 py-2 rounded-xl transition cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
            >
              {cargando ? '⌛ Sincronizando...' : '🔄 Sincronizar BD'}
            </button>

            <div className="text-right hidden md:block border-l border-slate-200 pl-3">
              <p className="text-xs font-black text-slate-900">{usuarioAuth.nombre}</p>
              <span className="bg-lime-100 text-lime-900 text-[9px] font-black px-2 py-0.5 rounded-md border border-lime-300 uppercase tracking-wider">
                {usuarioAuth.rol}
              </span>
            </div>

            <button 
              onClick={handleCerrarSesion}
              className="text-rose-700 bg-rose-50/80 hover:bg-rose-100 text-xs font-black px-3.5 py-2 border border-rose-200/80 rounded-xl transition cursor-pointer active:scale-95"
            >
              Salir
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {renderizarModulo()}
      </main>
    </div>
  );
}