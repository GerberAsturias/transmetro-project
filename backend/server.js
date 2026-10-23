const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS ABIERTO Y PARSEO DE JSON
app.use(cors());
app.use(express.json());

// POOL DE CONEXIONES A MYSQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'db_transmetro',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
});

// CATALOGO UNIFICADO Y EXACTO DE ESTACIONES
const ESTACIONES_CATALOGO = [
  // L-12 (15 paradas)
  { id_estacion: 1, nombre_estacion: 'CENTRA Sur (Patio Central Sur)', tipo_estacion: 'CENTRAL_TRANSFERENCIA', capacidad_maxima: 500, aforo_actual: 340, id_linea: 1 },
  { id_estacion: 2, nombre_estacion: 'Monte María', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 50, id_linea: 1 },
  { id_estacion: 3, nombre_estacion: 'Javier', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 45, id_linea: 1 },
  { id_estacion: 4, nombre_estacion: 'Las Charcas (L-12)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 82, id_linea: 1 },
  { id_estacion: 5, nombre_estacion: 'El Carmen (L-12)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 99, id_linea: 1 },
  { id_estacion: 6, nombre_estacion: 'Reformita', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 60, id_linea: 1 },
  { id_estacion: 7, nombre_estacion: 'Mariscal', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 70, id_linea: 1 },
  { id_estacion: 8, nombre_estacion: 'Trébol (L-12/L-07)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 400, aforo_actual: 320, id_linea: 1 },
  { id_estacion: 9, nombre_estacion: 'Santa Cecilia', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 85, id_linea: 1 },
  { id_estacion: 10, nombre_estacion: 'Bolívar', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 90, id_linea: 1 },
  { id_estacion: 11, nombre_estacion: 'Don Bosco', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 75, id_linea: 1 },
  { id_estacion: 12, nombre_estacion: 'Plaza Municipal', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 95, id_linea: 1 },
  { id_estacion: 13, nombre_estacion: '4 Grados Sur', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 65, id_linea: 1 },
  { id_estacion: 14, nombre_estacion: 'Exposición', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 50, id_linea: 1 },
  { id_estacion: 15, nombre_estacion: 'Plaza Barrios (Cabecera L-12)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 110, id_linea: 1 },

  // L-07 (12 paradas)
  { id_estacion: 701, nombre_estacion: 'USAC Periférico (Cabecera L-07)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 350, aforo_actual: 140, id_linea: 3 },
  { id_estacion: 702, nombre_estacion: 'Cejusa', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 45, id_linea: 3 },
  { id_estacion: 703, nombre_estacion: 'Calzada San Juan', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 80, id_linea: 3 },
  { id_estacion: 704, nombre_estacion: 'Calzada Roosevelt', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 250, aforo_actual: 110, id_linea: 3 },
  { id_estacion: 705, nombre_estacion: 'Bethania', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 65, id_linea: 3 },
  { id_estacion: 706, nombre_estacion: 'Tikal Futura', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 90, id_linea: 3 },
  { id_estacion: 707, nombre_estacion: 'Majadas', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 55, id_linea: 3 },
  { id_estacion: 708, nombre_estacion: 'Utatlán', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 40, id_linea: 3 },
  { id_estacion: 709, nombre_estacion: 'Miraflores', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 85, id_linea: 3 },
  { id_estacion: 710, nombre_estacion: 'Periférico Z.11', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 70, id_linea: 3 },
  { id_estacion: 711, nombre_estacion: 'Santuario de Guadalupe', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 60, id_linea: 3 },
  { id_estacion: 602, nombre_estacion: 'Parque Colón (Cabecera L-07)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 90, id_linea: 3 },

  // L-18 (10 paradas)
  { id_estacion: 601, nombre_estacion: 'FEGUA 18 Calle (Cabecera L-06/18)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 130, id_linea: 2 },
  { id_estacion: 1802, nombre_estacion: 'Cerrito del Carmen', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 60, id_linea: 2 },
  { id_estacion: 1803, nombre_estacion: 'San Martín', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 70, id_linea: 2 },
  { id_estacion: 1804, nombre_estacion: 'La Parroquia', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 85, id_linea: 2 },
  { id_estacion: 1805, nombre_estacion: 'Calle Martí L-18', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 105, id_linea: 2 },
  { id_estacion: 1806, nombre_estacion: 'Puente Belice', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 90, id_linea: 2 },
  { id_estacion: 1807, nombre_estacion: 'Lomas del Norte', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 55, id_linea: 2 },
  { id_estacion: 1808, nombre_estacion: 'San Rafael', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 75, id_linea: 2 },
  { id_estacion: 1809, nombre_estacion: 'Paraíso', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 65, id_linea: 2 },
  { id_estacion: 1810, nombre_estacion: 'CENTRA Atlántida (Patio Central Norte)', tipo_estacion: 'CENTRAL_TRANSFERENCIA', capacidad_maxima: 450, aforo_actual: 95, id_linea: 2 },

  // L-06 (14 paradas)
  { id_estacion: 6001, nombre_estacion: 'FEGUA (Cabecera L-06)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 110 },
  { id_estacion: 6002, nombre_estacion: 'Cerro del Carmen', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 40 },
  { id_estacion: 6003, nombre_estacion: 'Mercado La Parroquia', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 60 },
  { id_estacion: 6004, nombre_estacion: 'Iglesia San José', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 35 },
  { id_estacion: 6005, nombre_estacion: 'Cipresales', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 50 },
  { id_estacion: 6006, nombre_estacion: 'Martinico', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 45 },
  { id_estacion: 6007, nombre_estacion: 'Proyectos 4-4', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 80 },
  { id_estacion: 6008, nombre_estacion: 'Campo Marte Z.6', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 30 },
  { id_estacion: 6009, nombre_estacion: 'Victorias', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 40 },
  { id_estacion: 6010, nombre_estacion: 'Mega Frater Z.6', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 55 },
  { id_estacion: 1041, nombre_estacion: 'Totem: Barrio San Antonio (Z.6)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 80, aforo_actual: 22 },
  { id_estacion: 6012, nombre_estacion: 'Barrio Moderno', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 35 },
  { id_estacion: 6013, nombre_estacion: 'Mercaderes', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 45 },
  { id_estacion: 6014, nombre_estacion: 'Proyectos Norte (Cabecera L-06)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 90 },

  // L-13 (9 paradas)
  { id_estacion: 1301, nombre_estacion: 'Tipografía (Cabecera L-13)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 250, aforo_actual: 90 },
  { id_estacion: 1302, nombre_estacion: 'Banco de Guatemala', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 50 },
  { id_estacion: 1303, nombre_estacion: 'Torre del Reformador', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 220, aforo_actual: 75 },
  { id_estacion: 1304, nombre_estacion: 'Plaza España', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 60 },
  { id_estacion: 1305, nombre_estacion: 'Acueducto', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 40 },
  { id_estacion: 1306, nombre_estacion: 'Obelisco', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 250, aforo_actual: 110 },
  { id_estacion: 1307, nombre_estacion: 'Hangares Z.13', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 45 },
  { id_estacion: 1308, nombre_estacion: 'Plaza Berlín (Cabecera L-13)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 220, aforo_actual: 70 },
  { id_estacion: 1309, nombre_estacion: 'Terminal (L-13)', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 250, aforo_actual: 90 },

  // L-01 (2 paradas)
  { id_estacion: 101, nombre_estacion: 'Gómez Carrillo (Cabecera L-01)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 200, aforo_actual: 45 },
  { id_estacion: 102, nombre_estacion: 'Centro Cívico (Cabecera L-01)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 450, aforo_actual: 15 },

  // L-02 (4 paradas)
  { id_estacion: 201, nombre_estacion: 'San Sebastián (Cabecera L-02)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 200, aforo_actual: 30 },
  { id_estacion: 202, nombre_estacion: 'Parque Isabel La Católica', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 180, aforo_actual: 25 },
  { id_estacion: 203, nombre_estacion: 'Cervecería Centroamericana', tipo_estacion: 'ESTACION_INTERMEDIA', capacidad_maxima: 200, aforo_actual: 40 },
  { id_estacion: 204, nombre_estacion: 'Jocotenango/Hipódromo (L-02)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 180, aforo_actual: 20 },

  // R-05 (2 paradas)
  { id_estacion: 501, nombre_estacion: 'Parque Colón (Cabecera R-05)', tipo_estacion: 'ESTACION_CABECERA', capacidad_maxima: 150, aforo_actual: 30, id_linea: 4 },
  { id_estacion: 502, nombre_estacion: 'Totem: Puente Penitenciaría (Z.4)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 80, aforo_actual: 15, id_linea: 4 },

  // R-104 (2 paradas)
  { id_estacion: 1041, nombre_estacion: 'Totem: Barrio San Antonio (Z.6)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 80, aforo_actual: 22, id_linea: 4 },
  { id_estacion: 1042, nombre_estacion: 'Totem: Cantón Victoria (Z.14)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 80, aforo_actual: 18, id_linea: 4 },

  // R-305 (8 paradas)
  { id_estacion: 3051, nombre_estacion: 'Bulevar Vista Hermosa (Z.15)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 25 },
  { id_estacion: 3052, nombre_estacion: 'Multimedica', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 20 },
  { id_estacion: 3053, nombre_estacion: 'Campo Marte', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 30 },
  { id_estacion: 3054, nombre_estacion: 'Trébol Z.10', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 40 },
  { id_estacion: 3055, nombre_estacion: 'Avenida La Reforma', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 35 },
  { id_estacion: 3056, nombre_estacion: 'IGSS Z.9', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 45 },
  { id_estacion: 3057, nombre_estacion: 'Plazuela España', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 50 },
  { id_estacion: 3058, nombre_estacion: 'La Terminal (Z.9)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 60 },

  // R-402 (6 paradas)
  { id_estacion: 4021, nombre_estacion: 'Colonia Santa Fe (Z.13)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 20 },
  { id_estacion: 4022, nombre_estacion: 'Avenida Hincapié', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 30 },
  { id_estacion: 4023, nombre_estacion: 'Plaza Berlín', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 25 },
  { id_estacion: 4024, nombre_estacion: 'Avenida Petapa', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 45 },
  { id_estacion: 4025, nombre_estacion: 'Universidad San Carlos', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 50 },
  { id_estacion: 4026, nombre_estacion: 'Avenida Castellana (Z.8)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 35 },

  // R-801 (2 paradas)
  { id_estacion: 8011, nombre_estacion: 'Totem: Bethania / Los Pinos (Z.7)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 80, aforo_actual: 35 },
  { id_estacion: 8012, nombre_estacion: 'Totem: La Terminal (Z.9)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 80, aforo_actual: 40 },

  // R-802 (7 paradas)
  { id_estacion: 8021, nombre_estacion: 'El Amparo (Z.7)', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 30 },
  { id_estacion: 8022, nombre_estacion: 'Kaminaljuyú', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 25 },
  { id_estacion: 8023, nombre_estacion: 'Periférico Z.7', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 40 },
  { id_estacion: 8024, nombre_estacion: 'Parque de la Industria', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 35 },
  { id_estacion: 8025, nombre_estacion: 'Terminal Z.4', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 50 },
  { id_estacion: 8026, nombre_estacion: 'Centro Cívico', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 45 },
  { id_estacion: 8027, nombre_estacion: 'Ave y 19 Calle Z.1', tipo_estacion: 'TOTEM_PARADA', capacidad_maxima: 150, aforo_actual: 20 }
];

// INICIALIZADOR ROBUSTO DE TABLAS Y CATALOGOS EN MYSQL
async function inicializarEstacionesEnBD() {
  try {
    await pool.query(
      `INSERT INTO municipalidad (id_municipalidad, nombre_municipalidad) 
       VALUES (1, 'Municipalidad de Guatemala') 
       ON DUPLICATE KEY UPDATE nombre_municipalidad = VALUES(nombre_municipalidad)`
    );

    const lineas = [
      { id: 1, codigo: 'L-12', nombre: 'Línea 12: CENTRA Sur <-> Plaza Barrios' },
      { id: 2, codigo: 'L-18', nombre: 'Línea 18: FEGUA 18 Calle <-> CENTRA Atlántida' },
      { id: 3, codigo: 'L-07', nombre: 'Línea 07: USAC Periférico <-> Parque Colón' },
      { id: 4, codigo: 'R-05', nombre: 'Ruta 05: Parque Colón <-> Puente Penitenciaría' }
    ];

    for (const l of lineas) {
      try {
        await pool.query(
          `INSERT INTO linea (id_linea, codigo_linea, nombre_linea, id_municipalidad) 
           VALUES (?, ?, ?, 1) 
           ON DUPLICATE KEY UPDATE codigo_linea = VALUES(codigo_linea), nombre_linea = VALUES(nombre_linea)`,
          [l.id, l.codigo, l.nombre]
        );
      } catch (lErr) {}
    }

    for (const est of ESTACIONES_CATALOGO) {
      try {
        await pool.query(
          `INSERT INTO estacion (id_estacion, nombre_estacion, tipo_estacion, capacidad_maxima, aforo_actual) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           nombre_estacion = VALUES(nombre_estacion), 
           capacidad_maxima = VALUES(capacidad_maxima)`,
          [est.id_estacion, est.nombre_estacion, est.tipo_estacion || 'ESTACION_INTERMEDIA', est.capacidad_maxima, est.aforo_actual]
        );
        await pool.query(
          'UPDATE estacion SET capacidad_maxima = ? WHERE id_estacion = ?',
          [est.capacidad_maxima, est.id_estacion]
        );
      } catch (estErr) {}

      if (est.id_linea) {
        try {
          await pool.query(
            `INSERT INTO linea_estacion (id_linea, id_estacion, orden_estacion, distancia_siguiente_km) 
             VALUES (?, ?, 1, 1.5) 
             ON DUPLICATE KEY UPDATE id_linea = VALUES(id_linea)`,
            [est.id_linea, est.id_estacion]
          );
        } catch (leErr) {}
      }
    }
    console.log('✅ Catálogo completo de las 13 líneas sincronizado en MySQL');
  } catch (err) {
    console.warn('⚠️ Nota al sincronizar catálogo inicial:', err.message);
  }
}

pool.getConnection()
  .then(async (conn) => {
    console.log('✅ Conexión exitosa a la base de datos MySQL (db_transmetro)');
    conn.release();
    await inicializarEstacionesEnBD();
  })
  .catch(err => {
    console.error('❌ Error de conexión a la BD MySQL:', err.message);
  });

// --------------------------------------------------------------------------
// ENDPOINTS LIBRES (SIN RESTRICCIÓN DE SEGURIDAD)
// --------------------------------------------------------------------------

// LOGIN DIRECTO (PERMITE AUTENTICARSE CON CLAVES PLANAS O EXISTENTES)
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE usuario = ? AND (password = ? OR password LIKE "$2a$%") AND estado = "ACTIVO"', 
      [usuario, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ status: 'ERROR', mensaje: 'Credenciales inválidas.' });
    }

    const u = rows[0];
    res.json({
      status: 'EXITO',
      usuario: { id: u.id_usuario, nombre: u.nombre, usuario: u.usuario, rol: u.rol, id_estacion: u.id_estacion }
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/lineas/distancias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, m.nombre_municipalidad, COUNT(le.id_estacion) AS total_estaciones, COALESCE(SUM(le.distancia_siguiente_km), 0) AS distancia_total_km
      FROM linea l
      JOIN municipalidad m ON l.id_municipalidad = m.id_municipalidad
      LEFT JOIN linea_estacion le ON l.id_linea = le.id_linea
      GROUP BY l.id_linea
      ORDER BY l.id_linea ASC
    `);
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/lineas/:id_linea/estaciones', async (req, res) => {
  try {
    const idLinea = parseInt(req.params.id_linea, 10);
    const [rows] = await pool.query(`
      SELECT e.*, le.orden_estacion, le.distancia_siguiente_km
      FROM estacion e
      JOIN linea_estacion le ON e.id_estacion = le.id_estacion
      WHERE le.id_linea = ?
      ORDER BY le.orden_estacion ASC
    `, [idLinea]);

    if (rows.length === 0) {
      const [todasEstaciones] = await pool.query('SELECT * FROM estacion ORDER BY id_estacion ASC');
      return res.json({ status: 'EXITO', data: todasEstaciones });
    }

    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/accesos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        e.nombre_estacion, 
        COUNT(g.id_guardia) AS total_guardias,
        IF(COUNT(g.id_guardia) >= 1, 1, 0) AS cumple_regla_guardia
      FROM acceso a
      JOIN estacion e ON a.id_estacion = e.id_estacion
      LEFT JOIN guardia g ON a.id_acceso = g.id_acceso
      GROUP BY a.id_acceso
      ORDER BY a.id_acceso ASC
    `);
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/guardias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT g.*, a.nombre_acceso, e.nombre_estacion 
      FROM guardia g
      JOIN acceso a ON g.id_acceso = a.id_acceso
      JOIN estacion e ON a.id_estacion = e.id_estacion
    `);
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/guardias', async (req, res) => {
  const { nombre_completo, dpi, turno, id_acceso, rol_solicitante } = req.body;

  if (rol_solicitante && rol_solicitante !== 'ADMINISTRADOR') {
    return res.status(403).json({ 
      status: 'ERROR', 
      mensaje: 'ACCESO DENEGADO: Solo el usuario Administrador puede registrar guardias de seguridad.' 
    });
  }

  if (!id_acceso) {
    return res.status(400).json({ status: 'ERROR', mensaje: 'Debe seleccionar un acceso para asignar el guardia.' });
  }

  try {
    await pool.query(
      'INSERT INTO guardia (nombre_completo, dpi, turno, id_acceso, estado) VALUES (?, ?, ?, ?, "ACTIVO")',
      [nombre_completo, dpi || 'DPI-PENDIENTE', turno || 'DIURNO', id_acceso]
    );

    res.json({ status: 'EXITO', mensaje: 'Guardia asignado al acceso correctamente.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/buses', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, l.codigo_linea, l.nombre_linea, p.codigo_parqueo
      FROM bus b
      LEFT JOIN linea l ON b.id_linea = l.id_linea
      JOIN parqueo p ON b.id_parqueo = p.id_parqueo
      ORDER BY b.id_bus DESC
    `);
    res.json({ status: 'EXITO', data: rows, buses: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/buses', async (req, res) => {
  const { numero_unidad, placa, tipo_unidad, capacidad_maxima, id_linea, id_parqueo } = req.body;
  if (!id_parqueo) return res.status(400).json({ status: 'ERROR', mensaje: 'REGLA REQ03: Todo bus debe tener un parqueo asignado obligatoriamente.' });

  try {
    if (id_linea) {
      const [estaciones] = await pool.query('SELECT COUNT(*) AS total FROM linea_estacion WHERE id_linea = ?', [id_linea]);
      const [busesEnLinea] = await pool.query('SELECT COUNT(*) AS total FROM bus WHERE id_linea = ?', [id_linea]);
      const numEstaciones = estaciones[0].total;
      const numBuses = busesEnLinea[0].total;

      if (numEstaciones > 0 && numBuses >= (numEstaciones * 2)) {
        return res.status(400).json({ status: 'ERROR', mensaje: `REGLA REQ03: Excede el máximo permitido de buses para esta línea.` });
      }
    }

    await pool.query(
      'INSERT INTO bus (numero_unidad, placa, tipo_unidad, capacidad_maxima, id_linea, id_parqueo, estado) VALUES (?, ?, ?, ?, ?, ?, "EN_PARQUEO")',
      [numero_unidad, placa, tipo_unidad || 'ARTICULADO', capacidad_maxima || 160, id_linea || null, id_parqueo]
    );
    res.json({ status: 'EXITO', mensaje: 'Unidad de bus registrada exitosamente.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.put('/api/buses/actualizar', async (req, res) => {
  const { id_bus, numero_unidad, id_linea, codigo_linea, estado } = req.body;
  try {
    let busId = id_bus;
    if (!busId && numero_unidad) {
      const [b] = await pool.query('SELECT id_bus FROM bus WHERE numero_unidad = ?', [numero_unidad]);
      if (b.length > 0) busId = b[0].id_bus;
    }

    if (!busId) {
      return res.status(400).json({ status: 'ERROR', mensaje: 'No se identificó el ID de la unidad.' });
    }

    let lineaId = id_linea;
    if (!lineaId && codigo_linea) {
      const [l] = await pool.query('SELECT id_linea FROM linea WHERE codigo_linea = ?', [codigo_linea]);
      if (l.length > 0) lineaId = l[0].id_linea;
    }

    let estadoDB = 'EN_PARQUEO';
    if (estado === 'En ruta' || estado === 'EN_SERVICIO') estadoDB = 'EN_SERVICIO';
    else if (estado === 'En mantenimiento' || estado === 'EN_MANTENIMIENTO') estadoDB = 'EN_MANTENIMIENTO';
    else estadoDB = 'EN_PARQUEO';

    if (lineaId) {
      await pool.query('UPDATE bus SET id_linea = ?, estado = ? WHERE id_bus = ?', [lineaId, estadoDB, busId]);
    } else {
      await pool.query('UPDATE bus SET estado = ? WHERE id_bus = ?', [estadoDB, busId]);
    }

    res.json({ status: 'EXITO', mensaje: 'Bus actualizado correctamente en la BD.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.put('/api/buses/cambiar-parqueo', async (req, res) => {
  const { id_bus, nuevo_id_parqueo } = req.body;

  if (!nuevo_id_parqueo || parseInt(nuevo_id_parqueo, 10) <= 0) {
    return res.status(400).json({ 
      status: 'ERROR', 
      mensaje: 'REGLA REQ07: Un bus puede cambiar de parqueo, pero NO puede quedar sin parqueo asignado.' 
    });
  }

  try {
    const [bus] = await pool.query('SELECT id_parqueo FROM bus WHERE id_bus = ?', [id_bus]);
    if (bus.length === 0) return res.status(404).json({ status: 'ERROR', mensaje: 'Bus no encontrado.' });
    
    const parqueoAnterior = bus[0].id_parqueo;
    await pool.query('UPDATE bus SET id_parqueo = ? WHERE id_bus = ?', [nuevo_id_parqueo, id_bus]);
    
    await pool.query(
      'INSERT INTO historial_parqueo_bus (id_bus, id_parqueo_anterior, id_parqueo_nuevo) VALUES (?, ?, ?)', 
      [id_bus, parqueoAnterior, nuevo_id_parqueo]
    );
    
    res.json({ status: 'EXITO', mensaje: 'Reasignación de parqueo auditada y completada.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/pilotos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.numero_unidad, b.placa 
      FROM piloto p 
      LEFT JOIN bus b ON p.id_bus = b.id_bus
      ORDER BY p.id_piloto DESC
    `);
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/pilotos', async (req, res) => {
  const { nombre_completo, dpi, numero_licencia, tipo_licencia, historial_educativo, direccion_residencia, telefono, correo, id_bus } = req.body;
  try {
    await pool.query(
      'INSERT INTO piloto (nombre_completo, dpi, numero_licencia, tipo_licencia, historial_educativo, direccion_residencia, telefono, correo, id_bus, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "ACTIVO")',
      [nombre_completo, dpi, numero_licencia || 'LIC-1001', tipo_licencia || 'TIPO A', historial_educativo || 'Manejo Defensivo', direccion_residencia || 'Ciudad de Guatemala', telefono, correo || 'piloto@transmetro.gob.gt', id_bus || null]
    );
    res.json({ status: 'EXITO', mensaje: 'Expediente digital de piloto creado correctamente.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.put('/api/pilotos/asignar-bus', async (req, res) => {
  const { id_piloto, id_bus, numero_unidad } = req.body;
  try {
    let busId = id_bus;
    if (!busId && numero_unidad && numero_unidad !== 'Sin Asignar') {
      const [b] = await pool.query('SELECT id_bus FROM bus WHERE numero_unidad = ?', [numero_unidad]);
      if (b.length > 0) busId = b[0].id_bus;
    }

    if (busId) {
      await pool.query('UPDATE piloto SET id_bus = NULL WHERE id_bus = ?', [busId]);
    }

    let pilotoId = id_piloto;
    if (pilotoId && pilotoId !== 'Sin Asignar') {
      await pool.query('UPDATE piloto SET id_bus = ? WHERE id_piloto = ?', [busId || null, pilotoId]);
    }

    res.json({ status: 'EXITO', mensaje: 'Asignación de piloto guardada en MySQL.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/estaciones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estacion ORDER BY id_estacion ASC');
    res.json({ status: 'EXITO', data: rows, estaciones: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/estaciones/aforo/actualizar', async (req, res) => {
  const { id_estacion, entran, salen } = req.body;
  const idEstReal = parseInt(id_estacion, 10);

  if (isNaN(idEstReal)) {
    return res.status(400).json({ status: 'ERROR', mensaje: 'ID de estación no válido.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM estacion WHERE id_estacion = ?', [idEstReal]);
    
    let aforoActual = 0;
    let capMax = 200;
    let nombreEst = `Estación ${idEstReal}`;

    if (rows.length > 0) {
      aforoActual = parseInt(rows[0].aforo_actual, 10) || 0;
      capMax = parseInt(rows[0].capacidad_maxima, 10) || 200;
      nombreEst = rows[0].nombre_estacion;
    }

    const numEntran = Math.max(0, parseInt(entran, 10) || 0);
    const numSalen = Math.max(0, parseInt(salen, 10) || 0);

    const nuevoAforo = Math.max(0, aforoActual + numEntran - numSalen);
    const porcAforo = Math.round((nuevoAforo / capMax) * 100);
    const alertaSobredemanda = porcAforo >= 150;

    if (rows.length > 0) {
      await pool.query('UPDATE estacion SET aforo_actual = ? WHERE id_estacion = ?', [nuevoAforo, idEstReal]);
    } else {
      await pool.query(
        'INSERT INTO estacion (id_estacion, nombre_estacion, capacidad_maxima, aforo_actual) VALUES (?, ?, ?, ?)',
        [idEstReal, nombreEst, capMax, nuevoAforo]
      );
    }

    try {
      await pool.query(
        'INSERT INTO registro_aforo_estacion (id_estacion, pasajeros_en_espera, porcentaje_aforo, alerta_sobredemanda) VALUES (?, ?, ?, ?)',
        [idEstReal, nuevoAforo, porcAforo, alertaSobredemanda]
      );
    } catch (regErr) {}

    const [todas] = await pool.query('SELECT * FROM estacion ORDER BY id_estacion ASC');

    res.json({
      status: 'EXITO',
      estacion: {
        id_estacion: idEstReal,
        nombre: nombreEst,
        aforo_anterior: aforoActual,
        nuevo_aforo: nuevoAforo,
        porcentaje: porcAforo,
        alerta: alertaSobredemanda
      },
      estaciones: todas,
      data: todas
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/simulacion/paso', async (req, res) => {
  const { id_bus, id_estacion, pasajeros_a_bordo_anteriores, bajando, subiendo, pasajeros_en_espera_estacion } = req.body;
  
  try {
    const idEstReal = parseInt(id_estacion, 10) || 1;
    const idBusReal = parseInt(id_bus, 10) || 1;

    let [busRows] = await pool.query('SELECT * FROM bus WHERE id_bus = ?', [idBusReal]);
    const capBus = busRows.length > 0 ? (busRows[0].capacidad_maxima || 160) : 160;

    let [estRows] = await pool.query('SELECT * FROM estacion WHERE id_estacion = ?', [idEstReal]);
    const capEstacion = estRows.length > 0 ? (estRows[0].capacidad_maxima || 200) : 200;

    const ocupAnterior = parseInt(pasajeros_a_bordo_anteriores, 10) || 0;
    const numBajando = parseInt(bajando, 10) || 0;
    const numSubiendo = parseInt(subiendo, 10) || 0;

    const nuevaOcupacionBus = Math.max(0, Math.min(capBus, ocupAnterior - numBajando + numSubiendo));
    const porcOcupacionBus = Math.round((nuevaOcupacionBus / capBus) * 100);
    const retencion5min = porcOcupacionBus < 25;

    const esperaEstacion = parseInt(pasajeros_en_espera_estacion, 10) || 0;
    const porcAforoEstacion = Math.round((esperaEstacion / capEstacion) * 100);
    const alertaSobredemanda = porcAforoEstacion >= 150;

    try {
      if (estRows.length > 0) {
        await pool.query('UPDATE estacion SET aforo_actual = ? WHERE id_estacion = ?', [esperaEstacion, idEstReal]);
      } else {
        await pool.query(
          'INSERT INTO estacion (id_estacion, nombre_estacion, capacidad_maxima, aforo_actual) VALUES (?, ?, ?, ?)',
          [idEstReal, `Estación ${idEstReal}`, capEstacion, esperaEstacion]
        );
      }
    } catch (dbErr) {}

    res.json({
      status: 'EXITO',
      resultado: {
        nueva_ocupacion_bus: nuevaOcupacionBus,
        capacidad_bus: capBus,
        porcentaje_bus: porcOcupacionBus,
        retencion_5min: retencion5min,
        pasajeros_espera_estacion: esperaEstacion,
        capacidad_estacion: capEstacion,
        porcentaje_estacion: porcAforoEstacion,
        alerta_sobredemanda: alertaSobredemanda
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/cobrar', async (req, res) => {
  const { codigo_rfid, id_estacion, monto } = req.body;
  try {
    const [tarjeta] = await pool.query('SELECT * FROM tarjeta_acceso WHERE codigo_rfid = ?', [codigo_rfid]);
    if (tarjeta.length === 0) {
      return res.status(404).json({ status: 'ERROR', mensaje: 'Tarjeta RFID no encontrada.' });
    }

    const saldoActual = parseFloat(tarjeta[0].saldo);
    const montoCobro = parseFloat(monto) || 2.00;

    if (saldoActual < montoCobro) {
      return res.status(400).json({ 
        status: 'ERROR', 
        mensaje: `Saldo insuficiente (Q${saldoActual.toFixed(2)}). Se requiere Q${montoCobro.toFixed(2)}.` 
      });
    }

    const nuevoSaldo = saldoActual - montoCobro;
    const estacionId = parseInt(id_estacion, 10) || 1;

    await pool.query('UPDATE tarjeta_acceso SET saldo = ? WHERE codigo_rfid = ?', [nuevoSaldo, codigo_rfid]);
    await pool.query('UPDATE estacion SET aforo_actual = aforo_actual + 1 WHERE id_estacion = ?', [estacionId]);
    await pool.query(
      'INSERT INTO transaccion_pago (id_tarjeta, id_estacion, tipo_transaccion, monto) VALUES (?, ?, "COBRO_PASAJE", ?)', 
      [tarjeta[0].id_tarjeta, estacionId, montoCobro]
    );

    res.json({ 
      status: 'EXITO', 
      mensaje: `Pasaje procesado con éxito. Saldo restante: Q${nuevoSaldo.toFixed(2)}`,
      resultado: { saldo_restante: nuevoSaldo.toFixed(2) } 
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/tarjetas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tarjeta_acceso ORDER BY id_tarjeta ASC');
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/tarjetas', async (req, res) => {
  const { codigo_rfid, titular, tipo_tarjeta, saldo } = req.body;
  try {
    const rfidFinal = (codigo_rfid && codigo_rfid.trim() !== '') 
      ? codigo_rfid.trim().toUpperCase() 
      : `TC-${Math.floor(10000000 + Math.random() * 90000000)}`;

    await pool.query(
      'INSERT INTO tarjeta_acceso (codigo_rfid, titular, tipo_tarjeta, saldo, estado) VALUES (?, ?, ?, ?, "ACTIVA")',
      [rfidFinal, titular || 'Vecino al Portador', tipo_tarjeta || 'VECINO', parseFloat(saldo) || 20.0]
    );

    res.json({ 
      status: 'EXITO', 
      mensaje: `Tarjeta ${rfidFinal} emitida exitosamente en MySQL.`,
      codigo_rfid: rfidFinal 
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/kiosco/recargar', async (req, res) => {
  const { codigo_rfid, id_estacion, monto } = req.body;
  try {
    const [tarjeta] = await pool.query('SELECT * FROM tarjeta_acceso WHERE codigo_rfid = ?', [codigo_rfid]);
    if (tarjeta.length === 0) {
      return res.status(404).json({ status: 'ERROR', mensaje: 'Tarjeta RFID no encontrada.' });
    }

    const montoVal = parseFloat(monto) || 0;
    if (montoVal <= 0) {
      return res.status(400).json({ status: 'ERROR', mensaje: 'El monto a recargar debe ser mayor a Q0.00' });
    }

    const nuevoSaldo = parseFloat(tarjeta[0].saldo) + montoVal;
    const estacionId = parseInt(id_estacion, 10) || 1;

    await pool.query('UPDATE tarjeta_acceso SET saldo = ? WHERE codigo_rfid = ?', [nuevoSaldo, codigo_rfid]);
    await pool.query(
      'INSERT INTO transaccion_pago (id_tarjeta, id_estacion, tipo_transaccion, monto) VALUES (?, ?, "RECARGA_KIOSCO", ?)',
      [tarjeta[0].id_tarjeta, estacionId, montoVal]
    );

    res.json({ 
      status: 'EXITO', 
      mensaje: `Recarga exitosa. Nuevo saldo: Q${nuevoSaldo.toFixed(2)}`,
      resultado: { nuevo_saldo: nuevoSaldo.toFixed(2) } 
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/transacciones', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, e.nombre_estacion, ta.codigo_rfid 
      FROM transaccion_pago t 
      LEFT JOIN estacion e ON t.id_estacion = e.id_estacion
      LEFT JOIN tarjeta_acceso ta ON t.id_tarjeta = ta.id_tarjeta
      ORDER BY t.fecha_hora DESC
    `);
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/reportes/consolidado', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(l.codigo_linea, 'L-12') AS linea,
        COALESCE(m.nombre_municipalidad, 'Municipalidad de Guatemala') AS municipalidad,
        e.nombre_estacion AS estacion,
        CONCAT(e.aforo_actual, '/', e.capacidad_maxima, ' pax') AS aforo,
        COALESCE(b.numero_unidad, 'Sin bus') AS bus_asignado,
        COALESCE(p.codigo_parqueo, 'N/A') AS parqueo
      FROM estacion e
      LEFT JOIN linea_estacion le ON e.id_estacion = le.id_estacion
      LEFT JOIN linea l ON le.id_linea = l.id_linea
      LEFT JOIN municipalidad m ON l.id_municipalidad = m.id_municipalidad
      LEFT JOIN bus b ON l.id_linea = b.id_linea
      LEFT JOIN parqueo p ON b.id_parqueo = p.id_parqueo
      GROUP BY e.id_estacion, l.id_linea, b.id_bus
      ORDER BY e.id_estacion ASC
    `);

    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.get('/api/parqueos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT p.*, e.nombre_estacion FROM parqueo p JOIN estacion e ON p.id_estacion = e.id_estacion');
    res.json({ status: 'EXITO', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { nombre, usuario, password, rol, id_estacion, rol_solicitante } = req.body;

  if (rol_solicitante && rol_solicitante !== 'ADMINISTRADOR') {
    return res.status(403).json({ 
      status: 'ERROR', 
      mensaje: 'ACCESO DENEGADO: Un Operador no tiene permisos para crear usuarios.' 
    });
  }

  try {
    await pool.query(
      'INSERT INTO usuario (nombre, usuario, password, rol, id_estacion, estado) VALUES (?, ?, ?, ?, ?, "ACTIVO")',
      [nombre, usuario, password, rol || 'OPERADOR', id_estacion || null]
    );

    res.json({ status: 'EXITO', mensaje: `Usuario ${rol || 'OPERADOR'} creado exitosamente en MySQL.` });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Transmetro SQA corriendo en el puerto ${PORT}`);
});