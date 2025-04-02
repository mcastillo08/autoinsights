const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autoinsights',
};

// Crear pool de conexiones MySQL
const pool = mysql.createPool(dbConfig);

// Test de conexión a la base de datos
app.get('/api/test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.status(200).json({ message: 'Conexión a la base de datos exitosa' });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ message: 'Error al conectar con la base de datos' });
  }
});

// Endpoint de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  try {
    // Verificar si el usuario existe en la base de datos
    const [rows] = await pool.execute(
      'SELECT id, password, is_superuser, first_name, last_name, email, Agencia FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // En un escenario real, deberías verificar la contraseña con bcrypt.compare
    // Pero como es posible que las contraseñas en tu DB no estén hasheadas, vamos a compararlas directamente primero
    // Si implementas hashing después, puedes descomentar el código de bcrypt

    // Verificación directa (para desarrollo/testing)
    if (password === user.password) {
      // Crear objeto de usuario para enviar al cliente (sin la contraseña)
      const userResponse = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isSuperuser: user.is_superuser === 1,
        agencia: user.Agencia
      };

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: userResponse
      });
    }

    // Si llegamos aquí, intentamos con bcrypt por si las contraseñas están hasheadas
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (passwordMatch) {
        const userResponse = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          isSuperuser: user.is_superuser === 1,
          agencia: user.Agencia
        };

        return res.status(200).json({
          message: 'Inicio de sesión exitoso',
          user: userResponse
        });
      } else {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
    } catch (bcryptError) {
      console.error('Error al verificar la contraseña:', bcryptError);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
});

// Añade esto en server.js
app.get('/api/check-users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email FROM users LIMIT 5');
    res.json({ success: true, users: rows });
  } catch (error) {
    console.error('Error al verificar usuarios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar usuarios',
      error: error.message 
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});