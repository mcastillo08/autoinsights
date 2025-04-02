// src/server/server.js
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
  connectionLimit: 10
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.release();
    res.json({ message: 'Conexión a la base de datos exitosa' });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  } finally {
    if (connection) connection.release();
  }
});

// Función para verificar diferentes tipos de contraseñas (texto plano, SHA256)
const verifyPassword = (providedPassword, storedPassword) => {
  // 1. Verificar si es SHA256 (64 caracteres hexadecimales)
  if (storedPassword.match(/^[a-f0-9]{64}$/i)) {
    const hash = crypto.createHash('sha256').update(providedPassword).digest('hex');
    return hash === storedPassword;
  }
  
  // 2. Verificar como texto plano (último recurso, no recomendado en producción)
  return providedPassword === storedPassword;
};

// --- Endpoint para login ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar que se proporcionaron email y password
  if (!email || !password) {
    return res.status(400).json({ message: 'Se requiere email y contraseña' });
  }
  
  let connection;
  try {
    // Obtener una conexión del pool
    connection = await pool.getConnection();
    
    // Buscar al usuario por su email
    const [rows] = await connection.execute(
      'SELECT id, password, is_superuser, first_name, last_name, email, Agencia FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    
    // Verificar si el usuario existe
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    
    // Verificar la contraseña
    const passwordValid = verifyPassword(password, user.password);
    
    if (!passwordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Login exitoso - enviar datos del usuario (sin la contraseña)
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isSuperuser: user.is_superuser === 1,
        agencia: user.Agencia
      }
    });
    
  } catch (error) {
    console.error('Error en el proceso de login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    // Siempre liberar la conexión
    if (connection) connection.release();
  }
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});