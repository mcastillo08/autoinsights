// src/server/server.js
// ¡ADVERTENCIA! Esta versión permite comparar contraseñas en texto plano si no son hashes bcrypt.
// Se recomienda hashear todas las contraseñas en la BD con bcrypt para mayor seguridad.

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import timeout from 'connect-timeout';

// --- Configuración Inicial ---
dotenv.config(); // Carga las variables de entorno desde el archivo .env

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware Esencial ---
app.use(cors()); // Habilita Cross-Origin Resource Sharing para permitir peticiones del frontend
app.use(bodyParser.json()); // Parsea el cuerpo de las peticiones entrantes como JSON

// --- Configuración de la Conexión a la Base de Datos MySQL ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autoinsights',
  connectionLimit: 20, // Aumentar límite de conexiones
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 10000, // Timeout de conexión de 10 segundos
  acquireTimeout: 10000, // Timeout para obtener conexión de 10 segundos
};

let pool;
try {
  // Crear el pool de conexiones
  pool = mysql.createPool(dbConfig);
  console.log('✅ Pool de conexiones MySQL creado exitosamente.');

  // Probar una conexión inicial para verificar la configuración
  pool.getConnection()
    .then(connection => {
      console.log('✅ Conexión inicial a la base de datos verificada.');
      connection.release(); // Liberar la conexión de prueba
    })
    .catch(err => {
      // Loguea un error si la conexión inicial falla, pero no detiene el servidor necesariamente
      console.error('⚠️ Error al obtener conexión inicial del pool (verifica credenciales y DB):', err.message);
    });

} catch (error) {
  console.error('❌ Error CRÍTICO al crear el pool de MySQL. El servidor no puede iniciar.', error);
  process.exit(1); // Salir si el pool no se puede crear
}

// --- Definición de Rutas de la API ---

// Ruta simple para probar la conexión a la BD desde el exterior
app.get('/api/test', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('ℹ️ Petición a /api/test: Conexión obtenida.');
    connection.release();
    console.log('ℹ️ Petición a /api/test: Conexión liberada.');
    res.status(200).json({ message: 'Conexión a la base de datos exitosa' });
  } catch (error) {
    console.error('❌ Error en /api/test al intentar conectar:', error);
    if (connection) connection.release();
    res.status(500).json({ message: 'Error al conectar con la base de datos', error: error.message });
  }
});

// --- Endpoint Principal: Login de Usuario ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const logPrefix = `[Login: ${email}]`; // Prefijo para logs de esta petición
  const startTime = Date.now(); // Registrar tiempo de inicio

  console.log(`\n🚀 ${logPrefix} Recibida solicitud.`);

  // Validación básica de entrada
  if (!email || !password) {
    console.warn(`${logPrefix} ⚠️ Faltan credenciales (email o contraseña).`);
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  let connection;
  try {
    // Añadir un timeout para la conexión
    const connectionTimeout = setTimeout(() => {
      console.warn(`${logPrefix} ⏰ Conexión al pool está tomando demasiado tiempo.`);
    }, 5000);

    // 1. Obtener una conexión del pool
    connection = await pool.getConnection();
    clearTimeout(connectionTimeout);
    console.log(`${logPrefix} 🔗 Conexión obtenida del pool.`);

    // Registro de tiempo para cada paso crítico
    const queryStartTime = Date.now();

    // 2. Buscar al usuario por su email en la base de datos
    console.log(`${logPrefix} 🔍 Buscando usuario en la base de datos...`);
    const [rows] = await connection.execute(
      'SELECT id, password, is_superuser, first_name, last_name, email, Agencia FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const queryEndTime = Date.now();
    console.log(`${logPrefix} ⏱️ Tiempo de consulta a BD: ${queryEndTime - queryStartTime}ms`);

    // ... (resto del código de login existente)

    const totalTime = Date.now() - startTime;
    console.log(`${logPrefix} ⏱️ Tiempo total de procesamiento de login: ${totalTime}ms`);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`${logPrefix} ❌ Error total: ${totalTime}ms`, error);

    // Enviar respuesta de error más detallada para debugging
    res.status(500).json({
      message: 'Error en el servidor al procesar login',
      errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // 6. Liberar la conexión de vuelta al pool, SIEMPRE que se haya obtenido
    if (connection) {
      connection.release();
      console.log(`${logPrefix} 🔗 Conexión liberada de vuelta al pool.`);
    }
    console.log(`🏁 ${logPrefix} Fin del procesamiento de la solicitud.\n`);
  }
});

// Ruta de ejemplo para obtener algunos usuarios (si la necesitas)
app.get('/api/check-users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT id, email, first_name FROM users LIMIT 5');
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error('❌ Error en /api/check-users:', error);
    if (connection) connection.release();
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// --- Iniciar el Servidor Express ---
app.listen(port, () => {
  console.log(`🚀 Servidor Express escuchando en el puerto ${port}`);
  console.log(`   URL: http://localhost:${port}`);
  console.log('🕒 Esperando conexiones y solicitudes...');
});

app.use((err, req, res, next) => {
  if (err.code === 'ETIMEDOUT') {
    return res.status(504).json({ message: 'La solicitud tardó demasiado' });
  }
  next(err);
});



// --- Manejo de Cierre Limpio (Graceful Shutdown) ---
// Escucha la señal de interrupción (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('\n🚦 Recibido SIGINT (Ctrl+C). Iniciando cierre ordenado...');
  try {
    if (pool) {
      console.log('   Cerrando pool de conexiones MySQL...');
      await pool.end(); // Cierra todas las conexiones en el pool
      console.log('✅ Pool de MySQL cerrado correctamente.');
    }
  } catch (err) {
    console.error('❌ Error al cerrar el pool de MySQL durante el apagado:', err);
  } finally {
    console.log('👋 Servidor apagado.');
    process.exit(0); // Termina el proceso
  }
});