import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import TestExtractor from './TestExtractor.tsx'
import './index.css'

// Crear un router para tener múltiples páginas
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/test-extractor',
    element: <TestExtractor />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)