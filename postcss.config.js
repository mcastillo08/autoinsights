// postcss.config.js - DESPUÉS (Correcto)
export default { // O usa module.exports si tu proyecto no usa ES Modules aquí
  plugins: {
    '@tailwindcss/postcss': {}, // <-- ¡Usa el nuevo paquete!
    autoprefixer: {},          // Mantén autoprefixer si lo usas
  },
}