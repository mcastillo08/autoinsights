// src/server/server.js

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

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
  password: process.env.DB_PASSWORD || '', // Asegúrate que esta sea correcta en tu .env
  database: process.env.DB_NAME || 'autoinsights',
  connectionLimit: 10, // Número máximo de conexiones en el pool
  waitForConnections: true, // Esperar si todas las conexiones están ocupadas
  queueLimit: 0 // Sin límite en la cola de espera de conexiones
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

  console.log(`\n🚀 ${logPrefix} Recibida solicitud.`);

  // Validación básica de entrada
  if (!email || !password) {
    console.warn(`${logPrefix} ⚠️ Faltan credenciales (email o contraseña).`);
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  let connection;
  try {
    // 1. Obtener una conexión del pool
    connection = await pool.getConnection();
    console.log(`${logPrefix} 🔗 Conexión obtenida del pool.`);

    // 2. Buscar al usuario por su email en la base de datos
    console.log(`${logPrefix} 🔍 Buscando usuario en la base de datos...`);
    const [rows] = await connection.execute(
      'SELECT id, password, is_superuser, first_name, last_name, email, Agencia FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    // 3. Verificar si el usuario existe
    if (rows.length === 0) {
      console.warn(`${logPrefix} ❓ Usuario no encontrado.`);
      // Usar mensaje genérico por seguridad, no revelar si el email existe o no
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    console.log(`${logPrefix} ✔️ Usuario encontrado (ID: ${user.id}).`);

    // 4. Verificar la contraseña usando bcrypt.compare
    //    Esto compara la contraseña enviada (texto plano) con el hash almacenado en la BD.
    console.log(`${logPrefix} ⏳ Verificando contraseña con bcrypt...`);
    if (!user.password || !user.password.startsWith('$2')) {
        console.error(`${logPrefix} ❌ ERROR: La contraseña en la BD para este usuario NO es un hash bcrypt válido.`);
        console.error(`${logPrefix} ---> DEBES actualizar la contraseña en la BD con un hash generado por bcrypt.`);
        // Devolver error 500 porque es un problema de datos/configuración del servidor
        return res.status(500).json({ message: 'Error interno del servidor al verificar credenciales.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(`${logPrefix} Resultado de bcrypt.compare: ${passwordMatch}`);

    // 5. Enviar la respuesta adecuada
    if (passwordMatch) {
      // ¡Éxito! La contraseña coincide
      console.log(`${logPrefix} ✅ ¡Contraseña CORRECTA! Inicio de sesión autorizado.`);

      // Preparar la información del usuario para enviar al frontend (nunca enviar la contraseña)
      const userResponse = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isSuperuser: !!user.is_superuser, // Convertir a booleano explícitamente
        agencia: user.Agencia
      };

      // Enviar respuesta de éxito con los datos del usuario
      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: userResponse
      });

    } else {
      // La contraseña no coincidió
      console.warn(`${logPrefix} ❌ Contraseña INCORRECTA.`);
      // Usar mensaje genérico por seguridad
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

  } catch (error) {
    // Manejo de errores generales (problemas de BD, errores inesperados)
    console.error(`${logPrefix} ❌ Error general durante el proceso de login:`, error);
    // Asegurarse de no enviar detalles sensibles del error al cliente
    res.status(500).json({ message: 'Error en el servidor al procesar la solicitud de login.' });

  } finally {
    // 6. Liberar la conexión de vuelta al pool, SIEMPRE
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