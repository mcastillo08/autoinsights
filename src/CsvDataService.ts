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



// Nueva función mejorada para obtener una porción de los datos
export const obtenerClientesPaginados = async (
  pagina: number,
  elementosPorPagina: number
): Promise<{ clientes: Cliente[], total: number }> => {
  try {
    // Si no tenemos los datos en caché, los cargamos
    if (!clientesDataCache) {
      console.log('No hay caché, cargando datos CSV...');
      await cargarDatosCSVCompleto();
    }

    if (!clientesDataCache) {
      throw new Error('No se pudieron cargar los datos');
    }

    // Calcular índices para la paginación
    const inicio = (pagina - 1) * elementosPorPagina;

    // Verificar si estamos intentando acceder más allá del final del array
    if (inicio >= clientesDataCache.length) {
      console.warn(`Página ${pagina} fuera de rango: inicio (${inicio}) > longitud (${clientesDataCache.length})`);

      // Si hemos llegado al final de los datos disponibles, retornar el último lote
      if (clientesDataCache.length > 0) {
        const ultimaPagina = Math.ceil(clientesDataCache.length / elementosPorPagina);
        const inicioCorregido = (ultimaPagina - 1) * elementosPorPagina;
        const finCorregido = clientesDataCache.length;

        console.log(`Retornando última página ${ultimaPagina}: ${inicioCorregido}-${finCorregido}`);

        // Marcar esta página como servida
        paginasServidas[ultimaPagina] = true;

        return {
          clientes: clientesDataCache.slice(inicioCorregido, finCorregido),
          total: totalRegistros
        };
      }

      // Si no hay datos, retornar array vacío
      return {
        clientes: [],
        total: totalRegistros
      };
    }

    // Calcular el fin, asegurándose de no exceder el tamaño del array
    const fin = Math.min(inicio + elementosPorPagina, clientesDataCache.length);

    // Obtener los clientes de la página actual
    const clientesPagina = clientesDataCache.slice(inicio, fin);

    // Registrar que esta página ha sido servida
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
      '/urcsv.csv',
      './urcsv.csv',
      'urcsv.csv',
      '/src/assets/urcsv.csv',
      '../urcsv.csv',
      'assets/urcsv.csv'
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
  console.log('Caché de datos CSV limpiada');
};
