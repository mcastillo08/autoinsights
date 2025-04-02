import Papa from 'papaparse';

// Interfaz ClienteCSV (sin cambios)
export interface ClienteCSV {
  ORDEN: number;
  SERIE: string;
  Modelo: string;
  ANIO_VIN: number;
  NOMBRE_FAC: string;
  CONTACTO: string;
  AGENCI: string;
  CELULAR: string;
  TELEFONO?: string;
  OFICINA?: string;
  PAQUETE?: string;
  TOTAL?: number;
  NOMBRE_ASESOR?: string;
  ULT_VISITA?: string;
  DIAS_NOSHOW?: number;
  FECHA_FAC?: string;
}

// Definimos las interfaces para TypeScript
export interface Cliente {
  id: number;
  serie: string;
  modelo: string;
  año: number;
  nombreFactura: string;
  contacto: string;
  agencia: string;
  celular: string;
  telefono?: string;       // Campo opcional
  tOficina?: string;       // Campo opcional (sin espacio ni punto)
  cloudtalk?: string;      // Campo opcional
  paquete?: string;        // Campo opcional
  orden?: number;          // Campo opcional
  total?: number;          // Campo opcional
  aps?: string;            // Campo opcional para APS
  ultimaVisita?: Date;     // Añadir esta propiedad para la fecha de última visita
  diasSinVenir: number;    // Nuevo campo para los días sin venir
}

// Sistema de caché para evitar recargar todo el CSV
let csvTextCache: string | null = null;
let clientesDataCache: Cliente[] | null = null;
let totalRegistros = 0;
let paginasServidas: Record<number, boolean> = {}; // Registro de páginas ya servidas
let todosCargados = false; // Flag para saber si ya se cargaron todos los datos

// Nueva función mejorada para obtener una porción de los datos
// Modificada para cargar todos los datos de una vez
export const obtenerClientesPaginados = async (
  pagina: number,
  elementosPorPagina: number,
  precargaCompleta: boolean = true // Cambiado a true por defecto
): Promise<{ clientes: Cliente[], total: number }> => {
  try {
    // Si no tenemos los datos en caché, los cargamos
    if (!clientesDataCache) {
      console.log('No hay caché, cargando datos CSV...');
      await cargarDatosCSVCompleto();
      todosCargados = true;
    }

    if (!clientesDataCache) {
      throw new Error('No se pudieron cargar los datos');
    }

    // Si ya se cargaron todos los datos o se solicita la primera página, devolvemos todo
    if (todosCargados || pagina === 1 || precargaCompleta) {
      console.log(`Devolviendo todos los datos cargados: ${clientesDataCache.length} registros`);
      
      // Si estamos devolviendo todos los datos, asegurémonos de marcar todas las páginas como servidas
      const totalPaginas = Math.ceil(clientesDataCache.length / elementosPorPagina);
      for (let i = 1; i <= totalPaginas; i++) {
        paginasServidas[i] = true;
      }
      
      return {
        clientes: clientesDataCache,
        total: totalRegistros
      };
    }

    // Este código ya no se ejecutará debido a que todosCargados será true,
    // pero lo mantenemos por compatibilidad
    const inicio = (pagina - 1) * elementosPorPagina;
    const fin = Math.min(inicio + elementosPorPagina, clientesDataCache.length);

    if (inicio >= clientesDataCache.length) {
      console.warn(`Página ${pagina} fuera de rango: inicio (${inicio}) > longitud (${clientesDataCache.length})`);
      
      if (clientesDataCache.length > 0) {
        const ultimaPagina = Math.ceil(clientesDataCache.length / elementosPorPagina);
        const inicioCorregido = (ultimaPagina - 1) * elementosPorPagina;
        const finCorregido = clientesDataCache.length;

        console.log(`Retornando última página ${ultimaPagina}: ${inicioCorregido}-${finCorregido}`);
        paginasServidas[ultimaPagina] = true;

        return {
          clientes: clientesDataCache.slice(inicioCorregido, finCorregido),
          total: totalRegistros
        };
      }

      return {
        clientes: [],
        total: totalRegistros
      };
    }

    const clientesPagina = clientesDataCache.slice(inicio, fin);
    paginasServidas[pagina] = true;

    console.log(`Retornando página ${pagina} con ${clientesPagina.length} registros de ${totalRegistros} totales (${inicio}-${fin})`);

    return {
      clientes: clientesPagina,
      total: totalRegistros
    };
  } catch (error) {
    console.error('Error al obtener clientes paginados:', error);
    throw error;
  }
};

export const obtenerMetadatosFiltros = async (): Promise<{
  agencias: string[];
  modelos: string[];
  años: string[];
  paquetes: string[];
  asesores: string[];
}> => {
  try {
    // Si no tenemos los datos en caché, los cargamos
    if (!clientesDataCache) {
      console.log('No hay caché, cargando datos CSV para metadatos...');
      await cargarDatosCSVCompleto();
      todosCargados = true;
    }

    if (!clientesDataCache) {
      throw new Error('No se pudieron cargar los datos');
    }

    // Extraer todos los valores únicos para cada filtro
    const agencias = Array.from(new Set(clientesDataCache.map(cliente => cliente.agencia.trim())))
      .filter(agencia => agencia)
      .sort();

    // Extraer todos los modelos únicos
    const modelos = Array.from(new Set(clientesDataCache.map(cliente => cliente.modelo)))
      .filter(modelo => modelo)
      .sort();

    // Extraer todos los años únicos
    const años = Array.from(new Set(clientesDataCache.map(cliente => cliente.año.toString())))
      .filter(año => año)
      .sort((a, b) => Number(b) - Number(a)); // Ordenar descendente

    // Extraer todos los paquetes únicos
    const paquetes = Array.from(new Set(clientesDataCache.map(cliente =>
      cliente.paquete !== undefined ? cliente.paquete : 'null'
    )))
      .filter(paquete => paquete !== undefined)
      .sort();

    // Extraer todos los asesores APS únicos
    const asesores = Array.from(new Set(clientesDataCache.map(cliente => cliente.aps)))
      .filter((asesor): asesor is string => asesor !== undefined && asesor !== null)
      .sort();

    console.log(`Metadatos extraídos: ${agencias.length} agencias, ${modelos.length} modelos, ${años.length} años, ${paquetes.length} paquetes, ${asesores.length} asesores`);
    console.log('Agencias disponibles:', agencias);

    return {
      agencias,
      modelos,
      años,
      paquetes,
      asesores
    };
  } catch (error) {
    console.error('Error al obtener metadatos de filtros:', error);
    throw error;
  }
};

export const obtenerTodasAgencias = async (): Promise<string[]> => {
  try {
    // Si no tenemos los datos en caché, los cargamos
    if (!clientesDataCache) {
      console.log('No hay caché, cargando datos CSV para obtener todas las agencias...');
      await cargarDatosCSVCompleto();
      todosCargados = true;
    }

    if (!clientesDataCache) {
      throw new Error('No se pudieron cargar los datos');
    }

    // Extraer todas las agencias únicas (procesando el CSV completo)
    const agenciasSet = new Set<string>();
    clientesDataCache.forEach(cliente => {
      if (cliente.agencia && cliente.agencia.trim()) {
        agenciasSet.add(cliente.agencia.trim());
      }
    });

    const agencias = Array.from(agenciasSet).sort();
    console.log(`Obtenidas ${agencias.length} agencias únicas del CSV completo (${clientesDataCache.length} registros)`);

    return agencias;
  } catch (error) {
    console.error('Error al obtener todas las agencias:', error);
    return [];
  }
};

// Función para mapear de CSV a Cliente (con mejor manejo de tipos)
const mapearClienteCSVaCliente = (clienteCSV: ClienteCSV, index: number): Cliente => {
  // Convertir fecha de última visita a objeto Date si existe
  let ultimaVisita: Date | undefined = undefined;

  // Primero intentamos con FECHA_FAC para la última visita
  if (clienteCSV.FECHA_FAC) {
    try {
      // Verificar si es un string JSON o un string directo
      let fechaStr = clienteCSV.FECHA_FAC;

      // Si parece ser un objeto JSON
      if (typeof fechaStr === 'string' && (fechaStr.includes('value') || fechaStr.startsWith('{'))) {
        try {
          const fechaObj = JSON.parse(fechaStr);
          if (fechaObj.value) {
            fechaStr = fechaObj.value;
          }
        } catch (e) {
          // Si falla el parsing JSON, usar el string tal cual
          console.warn('Error al parsear JSON de fecha:', e);
        }
      }

      // Ahora procesamos la fecha según su formato
      if (typeof fechaStr === 'string') {
        if (fechaStr.includes('-')) {
          // Formato YYYY-MM-DD
          const [año, mes, dia] = fechaStr.split('-').map(num => parseInt(num, 10));
          ultimaVisita = new Date(año, mes - 1, dia); // Restamos 1 al mes
        } else if (fechaStr.includes('/')) {
          // Formato DD/MM/YYYY
          const [dia, mes, año] = fechaStr.split('/').map(num => parseInt(num, 10));
          ultimaVisita = new Date(año, mes - 1, dia);
        }
      }
    } catch (error) {
      console.error('Error al convertir FECHA_FAC:', error, clienteCSV.FECHA_FAC);
    }
  }
  // Si no hay FECHA_FAC, intentamos con ULT_VISITA (mantener compatibilidad)
  else if (clienteCSV.ULT_VISITA) {
    try {
      let fechaStr = clienteCSV.ULT_VISITA;

      // Si parece ser un objeto JSON
      if (typeof fechaStr === 'string' && (fechaStr.includes('value') || fechaStr.startsWith('{'))) {
        try {
          const fechaObj = JSON.parse(fechaStr);
          if (fechaObj.value) {
            fechaStr = fechaObj.value;
          }
        } catch (e) {
          // Si falla el parsing JSON, usar el string tal cual
          console.warn('Error al parsear JSON de fecha ULT_VISITA:', e);
        }
      }

      // Ahora procesamos la fecha según su formato
      if (typeof fechaStr === 'string') {
        if (fechaStr.includes('-')) {
          // Formato YYYY-MM-DD
          const [año, mes, dia] = fechaStr.split('-').map(num => parseInt(num, 10));
          ultimaVisita = new Date(año, mes - 1, dia);
        } else if (fechaStr.includes('/')) {
          // Formato DD/MM/YYYY
          const [dia, mes, año] = fechaStr.split('/').map(num => parseInt(num, 10));
          ultimaVisita = new Date(año, mes - 1, dia);
        }
      }
    } catch (error) {
      console.error('Error al convertir ULT_VISITA:', error, clienteCSV.ULT_VISITA);
    }
  }

  // Si la fecha no es válida, establecerla a undefined
  if (ultimaVisita && isNaN(ultimaVisita.getTime())) {
    ultimaVisita = undefined;
  }

  // Asegurarse de que los campos string no sean undefined
  return {
    id: index + 1, // Asignar un ID secuencial
    serie: clienteCSV.SERIE || '',
    modelo: clienteCSV.Modelo || '',
    año: clienteCSV.ANIO_VIN ? Number(clienteCSV.ANIO_VIN) : 0,
    nombreFactura: clienteCSV.NOMBRE_FAC || '',
    contacto: clienteCSV.CONTACTO || '',
    agencia: clienteCSV.AGENCI || '',
    celular: clienteCSV.CELULAR || '',
    telefono: clienteCSV.TELEFONO || undefined,
    tOficina: clienteCSV.OFICINA || undefined,
    cloudtalk: undefined, // No está en el CSV, se calculará después
    // Importante: Preservar el valor original de PAQUETE como string
    paquete: clienteCSV.PAQUETE !== undefined ? String(clienteCSV.PAQUETE) : undefined,
    orden: clienteCSV.ORDEN ? Number(clienteCSV.ORDEN) : undefined,
    total: clienteCSV.TOTAL ? Number(clienteCSV.TOTAL) : undefined,
    aps: clienteCSV.NOMBRE_ASESOR || '', // Usar NOMBRE_ASESOR para APS
    ultimaVisita: ultimaVisita,
    diasSinVenir: clienteCSV.DIAS_NOSHOW ? Number(clienteCSV.DIAS_NOSHOW) : 0
  };
};

// Función para cargar los datos completos del CSV con mejor manejo de errores
const cargarDatosCSVCompleto = async (intentos = 3): Promise<void> => {
  if (clientesDataCache) {
    console.log('Usando datos en caché');
    return;
  }

  try {
    console.log('Cargando archivo CSV completo...');

    // Intenta cargar el archivo desde diferentes rutas
    let response;
    const rutas = [
      '/granauto.csv',
      './granauto.csv',
      'granauto.csv',
      '/src/assets/granauto.csv',
      '../granauto.csv',
      'assets/granauto.csv'
    ];

    let rutaExitosa = '';
    for (const ruta of rutas) {
      try {
        response = await fetch(ruta, {
          // Añadir opción para no usar caché del navegador
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        if (response.ok) {
          rutaExitosa = ruta;
          console.log(`Archivo CSV cargado desde ${ruta}`);
          break;
        }
      } catch (e) {
        console.error(`Error al cargar desde ${ruta}:`, e);
      }
    }

    if (!response || !response.ok) {
      throw new Error(`No se pudo cargar el archivo CSV desde ninguna ubicación. Rutas intentadas: ${rutas.join(', ')}`);
    }

    // Almacenar el texto del CSV en caché
    csvTextCache = await response.text();

    // Verificar que el contenido sea realmente un CSV
    if (csvTextCache.trim().startsWith('<!doctype html>') || csvTextCache.trim().startsWith('<html>')) {
      console.error('El contenido devuelto es HTML, no un CSV');
      throw new Error(`El contenido devuelto es HTML, no un CSV. Ruta: ${rutaExitosa}`);
    }

    // Verificar que haya contenido real
    if (csvTextCache.trim().length < 100) {
      console.error('El CSV parece estar vacío o corrupto');
      throw new Error('El CSV parece estar vacío o corrupto');
    }

    console.log('Primeros 200 caracteres del CSV:', csvTextCache.substring(0, 200));

    // Parsear el CSV con PapaParse con opciones más robustas
    const resultado = await new Promise<Papa.ParseResult<ClienteCSV>>((resolve, reject) => {
      Papa.parse<ClienteCSV>(csvTextCache!, {
        header: true,
        // IMPORTANTE: Desactivar completamente dynamicTyping para mantener strings originales
        dynamicTyping: false,
        skipEmptyLines: true,
        delimiter: '', // Auto-detectar delimitador
        transformHeader: (header) => header.trim(), // Eliminar espacios en los encabezados
        error: (error: any) => {
          console.error('Error al parsear el CSV:', error);
          reject(error);
        },
        complete: (result) => {
          if (result.errors && result.errors.length > 0) {
            console.warn('CSV parseado con errores:', result.errors);
          }
          console.log(`CSV parseado exitosamente. ${result.data.length} filas encontradas.`);
          resolve(result);
        }
      });
    });

    // Verificar si hay datos
    if (resultado.data.length === 0) {
      throw new Error('El CSV no contiene datos');
    }

    // Imprimir algunos registros de muestra para verificar
    console.log('Muestra de 3 registros del CSV:');
    for (let i = 0; i < Math.min(3, resultado.data.length); i++) {
      console.log(`Registro ${i + 1}:`, resultado.data[i]);
    }

    totalRegistros = resultado.data.length;
    console.log(`Total de registros en el CSV: ${totalRegistros}`);

    // Mapear los datos CSV al formato Cliente y guardar en caché
    clientesDataCache = resultado.data
      .filter(row => row.SERIE) // Filtrar filas sin serie
      .map(mapearClienteCSVaCliente);

    console.log(`Se han mapeado ${clientesDataCache.length} registros de clientes.`);

    // Establecer que todos los datos están cargados
    todosCargados = true;

    // Reiniciar el registro de páginas servidas
    paginasServidas = { 1: true };

  } catch (error) {
    console.error('Error al cargar o procesar el CSV:', error);

    // Reintento si quedan intentos disponibles
    if (intentos > 1) {
      console.log(`Reintentando cargar el CSV (quedan ${intentos - 1} intentos)...`);
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 2000));
      return cargarDatosCSVCompleto(intentos - 1);
    }

    // Limpiar caché si hubo error y no hay más intentos
    csvTextCache = null;
    clientesDataCache = null;
    paginasServidas = {};
    todosCargados = false;
    throw error;
  }
};

// Mantener esta función para compatibilidad con código existente
export const cargarDatosCSV = async (): Promise<Cliente[]> => {
  try {
    console.log('Solicitud para cargar todos los datos del CSV');

    // Si tenemos los datos en caché, los devolvemos directamente
    if (clientesDataCache) {
      console.log('Devolviendo datos en caché completos');
      return clientesDataCache;
    }

    // Si no hay caché, cargamos el CSV completo
    await cargarDatosCSVCompleto();

    if (!clientesDataCache) {
      throw new Error('No se pudieron cargar los datos del CSV');
    }

    return clientesDataCache;
  } catch (error) {
    console.error('Error en cargarDatosCSV:', error);
    throw error;
  }
};

// Función para limpiar la caché (útil para recargar datos)
export const limpiarCacheCSV = (): void => {
  csvTextCache = null;
  clientesDataCache = null;
  totalRegistros = 0;
  paginasServidas = {};
  todosCargados = false;
  console.log('Caché de datos CSV limpiada');
};