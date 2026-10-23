import { useState, useEffect } from 'react';

const BASE_LINEAS = [
  { id: 11, codigo: 'L-12', nombre: 'Línea 12: CENTRA Sur <-> Plaza Barrios' },
  { id: 12, codigo: 'L-13', nombre: 'Línea 13: Tipografía <-> Plaza Berlín/Hangares' },
  { id: 9,  codigo: 'L-06', nombre: 'Línea 6: FEGUA <-> Proyectos 4-4' },
  { id: 10, codigo: 'L-07', nombre: 'Línea 7: USAC Periférico <-> Parque Colón' },
  { id: 7,  codigo: 'L-01', nombre: 'Línea 1: Gómez Carrillo <-> Centro Cívico' },
  { id: 8,  codigo: 'L-02', nombre: 'Línea 2: San Sebastián <-> Jocotenango/Hipódromo' },
  { id: 13, codigo: 'L-18', nombre: 'Línea 18: FEGUA 18 Calle <-> CENTRA Atlántida' },
  { id: 1,  codigo: 'R-05', nombre: 'Ruta 5: Parque Colón <-> Puente Penitenciaría' },
  { id: 2,  codigo: 'R-104', nombre: 'Ruta 104: Barrio San Antonio <-> Cantón Victoria' },
  { id: 3,  codigo: 'R-305', nombre: 'Ruta 305: Bulevar Vista Hermosa <-> La Terminal' },
  { id: 4,  codigo: 'R-402', nombre: 'Ruta 402: Colonia Santa Fe <-> Av. Petapa / Ave. Castellana' },
  { id: 5,  codigo: 'R-801', nombre: 'Ruta 801: Bethania/Los Pinos <-> La Terminal' },
  { id: 6,  codigo: 'R-802', nombre: 'Ruta 802: El Amparo <-> Ave y 19 Calle Z. 1' }
];

// MAPEO DE ESTACIONES CON IDS Y CAPACIDADES EXACTAS A MYSQL
const MAPA_ESTACIONES_POR_LINEA = {
  'L-12': [
    { id_estacion: 1, nombre_estacion: 'CENTRA Sur (Patio Central Sur)', capacidad_maxima: 500, aforo_actual: 340 },
    { id_estacion: 2, nombre_estacion: 'Monte María', capacidad_maxima: 200, aforo_actual: 50 },
    { id_estacion: 3, nombre_estacion: 'Javier', capacidad_maxima: 200, aforo_actual: 45 },
    { id_estacion: 4, nombre_estacion: 'Las Charcas (L-12)', capacidad_maxima: 180, aforo_actual: 82 },
    { id_estacion: 5, nombre_estacion: 'El Carmen (L-12)', capacidad_maxima: 200, aforo_actual: 99 },
    { id_estacion: 6, nombre_estacion: 'Reformita', capacidad_maxima: 180, aforo_actual: 60 },
    { id_estacion: 7, nombre_estacion: 'Mariscal', capacidad_maxima: 180, aforo_actual: 70 },
    { id_estacion: 8, nombre_estacion: 'Trébol (L-12/L-07)', capacidad_maxima: 400, aforo_actual: 320 },
    { id_estacion: 9, nombre_estacion: 'Santa Cecilia', capacidad_maxima: 200, aforo_actual: 85 },
    { id_estacion: 10, nombre_estacion: 'Bolívar', capacidad_maxima: 200, aforo_actual: 90 },
    { id_estacion: 11, nombre_estacion: 'Don Bosco', capacidad_maxima: 200, aforo_actual: 75 },
    { id_estacion: 12, nombre_estacion: 'Plaza Municipal', capacidad_maxima: 220, aforo_actual: 95 },
    { id_estacion: 13, nombre_estacion: '4 Grados Sur', capacidad_maxima: 200, aforo_actual: 65 },
    { id_estacion: 14, nombre_estacion: 'Exposición', capacidad_maxima: 200, aforo_actual: 50 },
    { id_estacion: 15, nombre_estacion: 'Plaza Barrios (Cabecera L-12)', capacidad_maxima: 250, aforo_actual: 110 }
  ],

  'L-07': [
    { id_estacion: 701, nombre_estacion: 'USAC Periférico (Cabecera L-07)', capacidad_maxima: 350, aforo_actual: 140 },
    { id_estacion: 702, nombre_estacion: 'Cejusa', capacidad_maxima: 200, aforo_actual: 45 },
    { id_estacion: 703, nombre_estacion: 'Calzada San Juan', capacidad_maxima: 220, aforo_actual: 80 },
    { id_estacion: 704, nombre_estacion: 'Calzada Roosevelt', capacidad_maxima: 250, aforo_actual: 110 },
    { id_estacion: 705, nombre_estacion: 'Bethania', capacidad_maxima: 200, aforo_actual: 65 },
    { id_estacion: 706, nombre_estacion: 'Tikal Futura', capacidad_maxima: 220, aforo_actual: 90 },
    { id_estacion: 707, nombre_estacion: 'Majadas', capacidad_maxima: 200, aforo_actual: 55 },
    { id_estacion: 708, nombre_estacion: 'Utatlán', capacidad_maxima: 180, aforo_actual: 40 },
    { id_estacion: 709, nombre_estacion: 'Miraflores', capacidad_maxima: 220, aforo_actual: 85 },
    { id_estacion: 710, nombre_estacion: 'Periférico Z.11', capacidad_maxima: 200, aforo_actual: 70 },
    { id_estacion: 711, nombre_estacion: 'Santuario de Guadalupe', capacidad_maxima: 200, aforo_actual: 60 },
    { id_estacion: 602, nombre_estacion: 'Parque Colón (Cabecera L-07)', capacidad_maxima: 250, aforo_actual: 90 }
  ],

  'L-18': [
    { id_estacion: 601, nombre_estacion: 'FEGUA 18 Calle (Cabecera L-06/18)', capacidad_maxima: 250, aforo_actual: 130 },
    { id_estacion: 1802, nombre_estacion: 'Cerrito del Carmen', capacidad_maxima: 200, aforo_actual: 60 },
    { id_estacion: 1803, nombre_estacion: 'San Martín', capacidad_maxima: 200, aforo_actual: 70 },
    { id_estacion: 1804, nombre_estacion: 'La Parroquia', capacidad_maxima: 220, aforo_actual: 85 },
    { id_estacion: 1805, nombre_estacion: 'Calle Martí L-18', capacidad_maxima: 200, aforo_actual: 105 },
    { id_estacion: 1806, nombre_estacion: 'Puente Belice', capacidad_maxima: 200, aforo_actual: 90 },
    { id_estacion: 1807, nombre_estacion: 'Lomas del Norte', capacidad_maxima: 180, aforo_actual: 55 },
    { id_estacion: 1808, nombre_estacion: 'San Rafael', capacidad_maxima: 200, aforo_actual: 75 },
    { id_estacion: 1809, nombre_estacion: 'Paraíso', capacidad_maxima: 180, aforo_actual: 65 },
    { id_estacion: 1810, nombre_estacion: 'CENTRA Atlántida (Patio Central Norte)', capacidad_maxima: 450, aforo_actual: 95 }
  ],

  'L-06': [
    { id_estacion: 6001, nombre_estacion: 'FEGUA (Cabecera L-06)', capacidad_maxima: 250, aforo_actual: 110 },
    { id_estacion: 6002, nombre_estacion: 'Cerro del Carmen', capacidad_maxima: 180, aforo_actual: 40 },
    { id_estacion: 6003, nombre_estacion: 'Mercado La Parroquia', capacidad_maxima: 200, aforo_actual: 60 },
    { id_estacion: 6004, nombre_estacion: 'Iglesia San José', capacidad_maxima: 180, aforo_actual: 35 },
    { id_estacion: 6005, nombre_estacion: 'Cipresales', capacidad_maxima: 200, aforo_actual: 50 },
    { id_estacion: 6006, nombre_estacion: 'Martinico', capacidad_maxima: 180, aforo_actual: 45 },
    { id_estacion: 6007, nombre_estacion: 'Proyectos 4-4', capacidad_maxima: 220, aforo_actual: 80 },
    { id_estacion: 6008, nombre_estacion: 'Campo Marte Z.6', capacidad_maxima: 180, aforo_actual: 30 },
    { id_estacion: 6009, nombre_estacion: 'Victorias', capacidad_maxima: 180, aforo_actual: 40 },
    { id_estacion: 6010, nombre_estacion: 'Mega Frater Z.6', capacidad_maxima: 200, aforo_actual: 55 },
    { id_estacion: 1041, nombre_estacion: 'Totem: Barrio San Antonio (Z.6)', capacidad_maxima: 80, aforo_actual: 22 },
    { id_estacion: 6012, nombre_estacion: 'Barrio Moderno', capacidad_maxima: 180, aforo_actual: 35 },
    { id_estacion: 6013, nombre_estacion: 'Mercaderes', capacidad_maxima: 180, aforo_actual: 45 },
    { id_estacion: 6014, nombre_estacion: 'Proyectos Norte (Cabecera L-06)', capacidad_maxima: 250, aforo_actual: 90 }
  ],

  'L-13': [
    { id_estacion: 1301, nombre_estacion: 'Tipografía (Cabecera L-13)', capacidad_maxima: 250, aforo_actual: 90 },
    { id_estacion: 1302, nombre_estacion: 'Banco de Guatemala', capacidad_maxima: 200, aforo_actual: 50 },
    { id_estacion: 1303, nombre_estacion: 'Torre del Reformador', capacidad_maxima: 220, aforo_actual: 75 },
    { id_estacion: 1304, nombre_estacion: 'Plaza España', capacidad_maxima: 200, aforo_actual: 60 },
    { id_estacion: 1305, nombre_estacion: 'Acueducto', capacidad_maxima: 180, aforo_actual: 40 },
    { id_estacion: 1306, nombre_estacion: 'Obelisco', capacidad_maxima: 250, aforo_actual: 110 },
    { id_estacion: 1307, nombre_estacion: 'Hangares Z.13', capacidad_maxima: 200, aforo_actual: 45 },
    { id_estacion: 1308, nombre_estacion: 'Plaza Berlín (Cabecera L-13)', capacidad_maxima: 220, aforo_actual: 70 },
    { id_estacion: 1309, nombre_estacion: 'Terminal (L-13)', capacidad_maxima: 250, aforo_actual: 90 }
  ],

  'L-01': [
    { id_estacion: 101, nombre_estacion: 'Gómez Carrillo (Cabecera L-01)', capacidad_maxima: 200, aforo_actual: 45 },
    { id_estacion: 102, nombre_estacion: 'Centro Cívico (Cabecera L-01)', capacidad_maxima: 450, aforo_actual: 15 }
  ],

  'L-02': [
    { id_estacion: 201, nombre_estacion: 'San Sebastián (Cabecera L-02)', capacidad_maxima: 200, aforo_actual: 30 },
    { id_estacion: 202, nombre_estacion: 'Parque Isabel La Católica', capacidad_maxima: 180, aforo_actual: 25 },
    { id_estacion: 203, nombre_estacion: 'Cervecería Centroamericana', capacidad_maxima: 200, aforo_actual: 40 },
    { id_estacion: 204, nombre_estacion: 'Jocotenango/Hipódromo (L-02)', capacidad_maxima: 180, aforo_actual: 20 }
  ],

  'R-05': [
    { id_estacion: 602, nombre_estacion: 'Parque Colón (Cabecera L-07)', capacidad_maxima: 250, aforo_actual: 90 },
    { id_estacion: 502, nombre_estacion: 'Totem: Puente Penitenciaría (Z.4)', capacidad_maxima: 80, aforo_actual: 15 }
  ],

  'R-104': [
    { id_estacion: 1041, nombre_estacion: 'Totem: Barrio San Antonio (Z.6)', capacidad_maxima: 80, aforo_actual: 22 },
    { id_estacion: 1042, nombre_estacion: 'Totem: Cantón Victoria (Z.14)', capacidad_maxima: 80, aforo_actual: 18 }
  ],

  'R-305': [
    { id_estacion: 3051, nombre_estacion: 'Bulevar Vista Hermosa (Z.15)', capacidad_maxima: 150, aforo_actual: 25 },
    { id_estacion: 3052, nombre_estacion: 'Multimedica', capacidad_maxima: 150, aforo_actual: 20 },
    { id_estacion: 3053, nombre_estacion: 'Campo Marte', capacidad_maxima: 150, aforo_actual: 30 },
    { id_estacion: 3054, nombre_estacion: 'Trébol Z.10', capacidad_maxima: 150, aforo_actual: 40 },
    { id_estacion: 3055, nombre_estacion: 'Avenida La Reforma', capacidad_maxima: 150, aforo_actual: 35 },
    { id_estacion: 3056, nombre_estacion: 'IGSS Z.9', capacidad_maxima: 150, aforo_actual: 45 },
    { id_estacion: 3057, nombre_estacion: 'Plazuela España', capacidad_maxima: 150, aforo_actual: 50 },
    { id_estacion: 1309, nombre_estacion: 'Terminal (L-13)', capacidad_maxima: 250, aforo_actual: 90 }
  ],

  'R-402': [
    { id_estacion: 4021, nombre_estacion: 'Colonia Santa Fe (Z.13)', capacidad_maxima: 150, aforo_actual: 20 },
    { id_estacion: 4022, nombre_estacion: 'Avenida Hincapié', capacidad_maxima: 150, aforo_actual: 30 },
    { id_estacion: 4023, nombre_estacion: 'Plaza Berlín', capacidad_maxima: 150, aforo_actual: 25 },
    { id_estacion: 4024, nombre_estacion: 'Avenida Petapa', capacidad_maxima: 150, aforo_actual: 45 },
    { id_estacion: 4025, nombre_estacion: 'Universidad San Carlos', capacidad_maxima: 150, aforo_actual: 50 },
    { id_estacion: 4026, nombre_estacion: 'Avenida Castellana (Z.8)', capacidad_maxima: 150, aforo_actual: 35 }
  ],

  'R-801': [
    { id_estacion: 8011, nombre_estacion: 'Totem: Bethania/Los Pinos (Z.7)', capacidad_maxima: 80, aforo_actual: 35 },
    { id_estacion: 1309, nombre_estacion: 'Terminal (L-13)', capacidad_maxima: 250, aforo_actual: 90 }
  ],

  'R-802': [
    { id_estacion: 8021, nombre_estacion: 'El Amparo (Z.7)', capacidad_maxima: 150, aforo_actual: 30 },
    { id_estacion: 8022, nombre_estacion: 'Kaminaljuyú', capacidad_maxima: 150, aforo_actual: 25 },
    { id_estacion: 8023, nombre_estacion: 'Periférico Z.7', capacidad_maxima: 150, aforo_actual: 40 },
    { id_estacion: 8024, nombre_estacion: 'Parque de la Industria', capacidad_maxima: 150, aforo_actual: 35 },
    { id_estacion: 8025, nombre_estacion: 'Terminal Z.4', capacidad_maxima: 150, aforo_actual: 50 },
    { id_estacion: 102, nombre_estacion: 'Centro Cívico (Cabecera L-01)', capacidad_maxima: 450, aforo_actual: 15 },
    { id_estacion: 8027, nombre_estacion: 'Ave y 19 Calle Z. 1', capacidad_maxima: 150, aforo_actual: 20 }
  ]
};

export default function MapaGeoespacial({ buses = [], API_BASE_URL = 'http://localhost:5000/api' }) {
  const [lineaSelId, setLineaSelId] = useState(11); // L-12 por defecto
  const [busesDeLinea, setBusesDeLinea] = useState([]);
  const [busSelId, setBusSelId] = useState('');

  const [todasEstacionesBD, setTodasEstacionesBD] = useState([]);
  const [aforosLocales, setAforosLocales] = useState({});
  const [idxEstacionActual, setIdxEstacionActual] = useState(0);

  // DATOS DE SIMULACIÓN DE PASAJEROS
  const [pasajerosEnBus, setPasajerosEnBus] = useState(0);
  const [bajandoInput, setBajandoInput] = useState(0);
  const [subiendoInput, setSubiendoInput] = useState(0);
  
  // FLUJO DE ESTACIÓN (ENTRAN / SALEN DEL ANDÉN)
  const [entranAndenInput, setEntranAndenInput] = useState(15);
  const [salenAndenInput, setSalenAndenInput] = useState(10);

  const [evaluando, setEvaluando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);
  const [historialSimulacion, setHistorialSimulacion] = useState([]);

  // CONSULTAR ESTADO DE ESTACIONES EN MYSQL
  const cargarEstacionesBD = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/estaciones`);
      const data = await res.json();
      const lista = data.estaciones || data.data || [];
      if (res.ok && Array.isArray(lista) && lista.length > 0) {
        setTodasEstacionesBD(lista);
        
        const mapAforos = {};
        lista.forEach(e => {
          mapAforos[Number(e.id_estacion)] = parseInt(e.aforo_actual, 10) || 0;
        });
        setAforosLocales(prev => ({ ...mapAforos, ...prev }));
      }
    } catch (err) {
      console.warn('Error al cargar estaciones desde MySQL:', err);
    }
  };

  useEffect(() => {
    cargarEstacionesBD();
  }, []);

  // RESETEAR POSICIÓN AL CAMBIAR DE LÍNEA
  useEffect(() => {
    setIdxEstacionActual(0);
  }, [lineaSelId]);

  // FILTRAR BUSES ASIGNADOS
  useEffect(() => {
    const lineaActualObj = BASE_LINEAS.find(l => l.id === parseInt(lineaSelId));
    const codigoLinea = lineaActualObj ? lineaActualObj.codigo : 'L-12';

    const filtrados = buses.filter(b => {
      const matchId = b.id_linea && parseInt(b.id_linea) === parseInt(lineaSelId);
      const matchCodigo = b.linea && b.linea.toString().toUpperCase() === codigoLinea.toUpperCase();
      return matchId || matchCodigo;
    });

    setBusesDeLinea(filtrados);

    if (filtrados.length > 0) {
      const primerBusId = filtrados[0].id_bus || filtrados[0].id;
      setBusSelId(primerBusId);
      setPasajerosEnBus(86);
      setBajandoInput(20);
      setSubiendoInput(15);
    } else {
      setBusSelId('');
      setPasajerosEnBus(0);
      setBajandoInput(0);
      setSubiendoInput(0);
    }
  }, [lineaSelId, buses]);

  const lineaActualObj = BASE_LINEAS.find(l => l.id === parseInt(lineaSelId));
  const codLinea = lineaActualObj ? lineaActualObj.codigo : 'L-12';
  const estacionesBase = MAPA_ESTACIONES_POR_LINEA[codLinea] || MAPA_ESTACIONES_POR_LINEA['L-12'];

  // VINCULAR ESTACIONES CON ESTADO VIVO Y CAPACIDAD REAL DE MYSQL
  const estacionesRuta = estacionesBase.map(estBase => {
    const idEst = Number(estBase.id_estacion);
    const estBD = todasEstacionesBD.find(e => Number(e.id_estacion) === idEst);
    
    const aforoActual = (aforosLocales[idEst] !== undefined)
      ? aforosLocales[idEst]
      : estBD
      ? (parseInt(estBD.aforo_actual, 10) || 0)
      : (estBase.aforo_actual || 0);

    const capacidadReal = estBD
      ? (parseInt(estBD.capacidad_maxima, 10) || estBase.capacidad_maxima)
      : estBase.capacidad_maxima;

    return {
      ...estBase,
      aforo_actual: aforoActual,
      capacidad_maxima: capacidadReal
    };
  });

  const busActivo = busesDeLinea.find(b => (b.id_bus || b.id) == busSelId) || null;
  const estacionActiva = estacionesRuta[idxEstacionActual] || estacionesRuta[0];

  const capBusVal = busActivo ? (busActivo.capacidad || busActivo.capacidad_maxima || 160) : 0;
  const porcBusVal = (busActivo && capBusVal > 0) ? Math.round((pasajerosEnBus / capBusVal) * 100) : 0;
  const retencionVal = busActivo && porcBusVal < 25;

  const capEstVal = estacionActiva?.capacidad_maxima || 220;
  const aforoEstacionActual = estacionActiva?.aforo_actual || 0;
  const porcEstVal = capEstVal > 0 ? Math.round((aforoEstacionActual / capEstVal) * 100) : 0;
  const sobredemandaVal = porcEstVal >= 150;

  // PROCESAR MOVIMIENTO DE BUS Y FLUJO EN ESTACIÓN
  const handleProcesarSimulacion = async (e) => {
    e.preventDefault();
    setMensajeError(null);

    if (!estacionActiva) return;

    if (!busActivo) {
      setMensajeError('Debes asignar un bus a esta ruta antes de procesar la simulación.');
      return;
    }

    setEvaluando(true);

    const busIdSql = busActivo.id_bus || busActivo.id;
    const estIdSql = Number(estacionActiva.id_estacion);

    try {
      // 1. Actualizar aforo en MySQL
      const resAforo = await fetch(`${API_BASE_URL}/estaciones/aforo/actualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estacion: estIdSql,
          entran: parseInt(entranAndenInput, 10) || 0,
          salen: parseInt(salenAndenInput, 10) || 0
        })
      });

      const dataAforo = await resAforo.json();

      if (resAforo.ok && dataAforo.status === 'EXITO') {
        const listaActualizada = dataAforo.estaciones || dataAforo.data || [];
        if (Array.isArray(listaActualizada) && listaActualizada.length > 0) {
          setTodasEstacionesBD(listaActualizada);
        }
      }

      const nuevoAforoEstacion = Math.max(0, aforoEstacionActual + parseInt(entranAndenInput, 10) - parseInt(salenAndenInput, 10));

      setAforosLocales(prev => ({
        ...prev,
        [estIdSql]: nuevoAforoEstacion
      }));

      // 2. Procesar simulación de paso del bus
      const resPaso = await fetch(`${API_BASE_URL}/simulacion/paso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bus: busIdSql,
          id_estacion: estIdSql,
          pasajeros_a_bordo_anteriores: pasajerosEnBus,
          bajando: parseInt(bajandoInput, 10) || 0,
          subiendo: parseInt(subiendoInput, 10) || 0,
          pasajeros_en_espera_estacion: nuevoAforoEstacion
        })
      });

      const dataPaso = await resPaso.json();

      if (resPaso.ok && dataPaso.status === 'EXITO') {
        const resObj = dataPaso.resultado;
        setPasajerosEnBus(resObj.nueva_ocupacion_bus);

        const nuevoLog = {
          hora: new Date().toLocaleTimeString(),
          estacionNombre: estacionActiva.nombre_estacion,
          busUnidad: busActivo ? (busActivo.numero_unidad || busActivo.id) : 'TM-BUS',
          bajaron: bajandoInput,
          subieron: subiendoInput,
          pasajerosFinal: resObj.nueva_ocupacion_bus,
          porcBus: resObj.porcentaje_bus,
          retencion: resObj.retencion_5min,
          aforoEstacion: nuevoAforoEstacion,
          porcEstacion: resObj.porcentaje_estacion,
          sobredemanda: resObj.alerta_sobredemanda
        };

        setHistorialSimulacion(prev => [nuevoLog, ...prev]);

        setEntranAndenInput(15);
        setSalenAndenInput(10);
        setBajandoInput(Math.floor(Math.random() * (resObj.nueva_ocupacion_bus + 1)));
        setSubiendoInput(Math.floor(Math.random() * 20));
      } else {
        setMensajeError(dataPaso.mensaje || 'Error al procesar simulación.');
      }
    } catch (err) {
      console.error('Error en simulación:', err);
      setMensajeError('No se pudo conectar con el servidor MySQL.');
    } finally {
      setEvaluando(false);
    }
  };

  const handleAvanzarEstacion = () => {
    if (estacionesRuta.length === 0) return;
    setIdxEstacionActual((prev) => (prev + 1) % estacionesRuta.length);
    setMensajeError(null);
  };

  return (
    <div className="space-y-6">

      {/* CONTROLES SUPERIORES */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-900 text-base">Consola Geoespacial y Control de Aforo</h3>
          <p className="text-xs text-slate-500 font-medium">Gestión integral de recorridos de bus, aforo bidireccional y alertas de sobredemanda</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">SELECCIONAR RUTA / LÍNEA</label>
            <select
              value={lineaSelId}
              onChange={(e) => setLineaSelId(parseInt(e.target.value, 10))}
              className="border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs font-black text-slate-900 focus:outline-none focus:border-lime-500 cursor-pointer min-w-[240px]"
            >
              {BASE_LINEAS.map((l) => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">BUS ASIGNADO A ESTA RUTA</label>
            <select
              value={busSelId}
              onChange={(e) => setBusSelId(e.target.value)}
              className="border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs font-black text-slate-900 focus:outline-none focus:border-lime-500 cursor-pointer min-w-[220px]"
            >
              {busesDeLinea.length > 0 ? (
                busesDeLinea.map((b) => (
                  <option key={b.id_bus || b.id} value={b.id_bus || b.id}>
                    {b.id || b.numero_unidad} ({b.placa}) - Cap: {b.capacidad || b.capacidad_maxima || 160} pax
                  </option>
                ))
              ) : (
                <option value="">-- Sin bus asignado --</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* MAPA INTERACTIVO DE ESTACIONES */}
      <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">MAPA INTERACTIVO DE ESTACIONES</span>
            <h4 className="text-base font-black text-white">
              {BASE_LINEAS.find(l => l.id === lineaSelId)?.nombre} — {estacionesRuta.length} Estaciones
            </h4>
          </div>

          {busActivo ? (
            <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-xl text-xs font-black text-lime-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping"></span>
              Unidad en Tránsito: {busActivo.id || busActivo.numero_unidad} ({pasajerosEnBus} pax a bordo)
            </div>
          ) : (
            <div className="bg-rose-950/80 border border-rose-800 px-4 py-1.5 rounded-xl text-xs font-black text-rose-300">
              ⚠️ Sin Bus Asignado
            </div>
          )}
        </div>

        {/* NODOS DE ESTACIÓN */}
        <div className="relative py-8 px-4 overflow-x-auto">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>

          <div className="relative z-10 flex items-center justify-between min-w-[700px] gap-4">
            {estacionesRuta.map((est, idx) => {
              const esEstacionActual = idx === idxEstacionActual;
              const aforoEst = est.aforo_actual || 0;
              const porc = Math.round((aforoEst / (est.capacidad_maxima || 200)) * 100);
              const esSobredemanda = porc >= 150;

              return (
                <div
                  key={est.id_estacion || idx}
                  onClick={() => setIdxEstacionActual(idx)}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    esEstacionActual ? 'scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="h-7">
                    {esEstacionActual && busActivo && (
                      <span className="bg-lime-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-lg animate-bounce inline-block">
                        🚌 BUS AQUÍ
                      </span>
                    )}
                  </div>

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all ${
                    esSobredemanda
                      ? 'bg-rose-600 border-rose-300 text-white shadow-lg ring-4 ring-rose-500/30 animate-pulse'
                      : esEstacionActual
                      ? 'bg-lime-400 border-white text-slate-950 ring-4 ring-lime-400/30'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="mt-2 text-center max-w-[100px]">
                    <p className={`text-[10px] font-black leading-tight ${
                      esSobredemanda ? 'text-rose-400' : esEstacionActual ? 'text-lime-300' : 'text-slate-300'
                    }`}>
                      {est.nombre_estacion}
                    </p>
                    <span className={`text-[9px] font-mono block mt-0.5 ${esSobredemanda ? 'text-rose-400 font-black animate-pulse' : 'text-slate-400'}`}>
                      {aforoEst} pax ({porc}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FORMULARIO Y RESULTADO DE REGLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              ESTACIÓN {idxEstacionActual + 1} DE {estacionesRuta.length}
            </span>
            <button
              type="button"
              onClick={handleAvanzarEstacion}
              className="text-xs font-black text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition cursor-pointer border border-purple-200"
            >
              Siguiente Estación ➡️
            </button>
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900">{estacionActiva?.nombre_estacion}</h4>
            <p className="text-xs text-slate-500 font-medium">Aforo actual: <strong className="text-slate-900 font-mono">{aforoEstacionActual} pax</strong> (Cap. Máx: {capEstVal} pax)</p>
          </div>

          <form onSubmit={handleProcesarSimulacion} className="space-y-4">
            
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">FLUJO EN ANDÉN (ENTRAN / SALEN)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">👥 ENTRAN AL ANDÉN</label>
                  <input
                    type="number"
                    min="0"
                    value={entranAndenInput}
                    onChange={(e) => setEntranAndenInput(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl p-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-rose-600 uppercase mb-1">🚪 SALEN DEL ANDÉN</label>
                  <input
                    type="number"
                    min="0"
                    value={salenAndenInput}
                    onChange={(e) => setSalenAndenInput(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl p-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border space-y-2 transition-all ${
              busActivo ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-100/50 border-slate-200 opacity-60'
            }`}>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                MOVIMIENTO DE BUS {busActivo ? `(${pasajerosEnBus} pax a bordo)` : '(SIN BUS)'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-rose-600 uppercase mb-1">⬇️ BAJAN DEL BUS</label>
                  <input
                    type="number"
                    min="0"
                    max={pasajerosEnBus}
                    value={bajandoInput}
                    onChange={(e) => setBajandoInput(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl p-2 text-xs font-bold text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
                    disabled={!busActivo}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">⬆️ SUBEN AL BUS</label>
                  <input
                    type="number"
                    min="0"
                    value={subiendoInput}
                    onChange={(e) => setSubiendoInput(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl p-2 text-xs font-bold text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
                    disabled={!busActivo}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={evaluando || !busActivo}
              className={`w-full font-black py-3.5 rounded-2xl text-xs transition shadow-xs ${
                !busActivo
                  ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed opacity-80'
                  : 'bg-[#84cc16] hover:bg-lime-600 active:bg-lime-700 text-slate-950 cursor-pointer disabled:opacity-50'
              }`}
            >
              {!busActivo
                ? '⚠️ Asigne un bus a esta ruta para procesar'
                : evaluando
                ? 'Procesando en MySQL...'
                : '⚡ Procesar Estación y Guardar en BD'}
            </button>
          </form>

          {mensajeError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-bold">
              ⚠️ {mensajeError}
            </div>
          )}
        </div>

        {/* TARJETAS DE RESULTADO Y HISTORIAL */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* TARJETA DE OCUPACIÓN DE BUS (REQL 15) */}
            {!busActivo ? (
              <div className="p-5 rounded-3xl border border-slate-200 bg-slate-100/70 text-slate-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">REQL 15: OCUPACIÓN BUS</span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full border bg-slate-200 border-slate-300 text-slate-600">
                    N/A
                  </span>
                </div>
                <h4 className="text-xl font-black font-mono text-slate-400">-- / -- pax</h4>
                <p className="text-xs font-bold mt-2 text-slate-500">
                  ⚠️ No hay unidad asignada a esta ruta. Asigne un bus en el menú superior para monitorear ocupación.
                </p>
              </div>
            ) : (
              <div className={`p-5 rounded-3xl border transition-all ${
                retencionVal ? 'bg-amber-50/80 border-amber-300 text-amber-950' : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider">REQL 15: OCUPACIÓN BUS</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    retencionVal ? 'bg-amber-200 border-amber-400 text-amber-900' : 'bg-emerald-200 border-emerald-400 text-emerald-900'
                  }`}>
                    {porcBusVal}%
                  </span>
                </div>
                <h4 className="text-xl font-black font-mono">{pasajerosEnBus} / {capBusVal} pax</h4>
                <p className="text-xs font-bold mt-2">
                  {retencionVal 
                    ? '⏱️ Ocupación menor al 25%. Se activó retención obligatoria de 5 minutos.' 
                    : '✅ Ocupación adecuada (25%+). Salida autorizada.'}
                </p>
              </div>
            )}

            {/* TARJETA DE AFORO DE ESTACIÓN (REQL 04) */}
            <div className={`p-5 rounded-3xl border transition-all ${
              sobredemandaVal ? 'bg-rose-50/80 border-rose-300 text-rose-950 animate-pulse' : 'bg-blue-50/80 border-blue-300 text-blue-950'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">REQL 04: AFORO ESTACIÓN</span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  sobredemandaVal ? 'bg-rose-200 border-rose-400 text-rose-900' : 'bg-blue-200 border-blue-400 text-blue-900'
                }`}>
                  {porcEstVal}%
                </span>
              </div>
              <h4 className="text-xl font-black font-mono">{aforoEstacionActual} / {capEstVal} pax</h4>
              <p className="text-xs font-bold mt-2">
                {sobredemandaVal 
                  ? '🚨 ¡ALERTA SOBREDEMANDA (≥150%)! Estación colapsada. Despachar bus de apoyo.' 
                  : '✅ Aforo de la estación en rango operativo.'}
              </p>
            </div>

          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100">
            <h4 className="font-black text-slate-900 text-xs mb-3">Historial del Trayecto (Auditado en MySQL)</h4>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {historialSimulacion.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic font-bold">No hay registros procesados aún en este trayecto.</p>
              ) : (
                historialSimulacion.map((log, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 mr-2">{log.hora}</span>
                      <strong className="text-slate-900">{log.estacionNombre}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Bus: {log.pasajerosFinal} pax ({log.porcBus}%) | Andén: {log.aforoEstacion} pax ({log.porcEstacion}%)
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {log.retencion && <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] px-2 py-0.5 rounded-md">Retención 5m</span>}
                      {log.sobredemanda && <span className="bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[9px] px-2 py-0.5 rounded-md">Alerta 150%+</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ESTADO GENERAL DEL AFORO EN RED */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
        <div>
          <h4 className="font-black text-slate-900 text-sm">Estado General del Aforo en Estaciones de la Red</h4>
          <p className="text-xs text-slate-500 font-medium">Monitoreo global en tiempo real sincronizado con MySQL ({todasEstacionesBD.length} estaciones activas)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todasEstacionesBD.map((est) => {
            const idEst = Number(est.id_estacion);
            const capMax = parseInt(est.capacidad_maxima, 10) || 200;
            const aforo = (aforosLocales[idEst] !== undefined)
              ? aforosLocales[idEst]
              : (parseInt(est.aforo_actual, 10) || 0);

            const porc = Math.round((aforo / capMax) * 100);
            const esSobredemanda = porc >= 150;

            return (
              <div
                key={est.id_estacion}
                className={`bg-slate-50/50 p-4 rounded-2xl border transition-all ${
                  esSobredemanda ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-black text-slate-900 text-xs">{est.nombre_estacion}</h5>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    esSobredemanda ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {esSobredemanda ? '🚨 SOBREDEMANDA' : 'NORMAL'}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-extrabold mb-1">
                    <span className="text-slate-500">Andén:</span>
                    <span className={`font-mono ${esSobredemanda ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
                      {aforo} / {capMax} pax ({porc}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        esSobredemanda ? 'bg-rose-500' : porc >= 80 ? 'bg-amber-500' : 'bg-[#84cc16]'
                      }`}
                      style={{ width: `${Math.min(porc, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}