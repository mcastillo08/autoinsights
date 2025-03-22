import Papa from 'papaparse';

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
}

export interface Cliente {
  id: number;
  serie: string;
  modelo: string;
  año: number;
  nombreFactura: string;
  contacto: string;
  agencia: string;
  celular: string;
  telefono?: string;
  tOficina?: string;
  cloudtalk?: string;
  paquete?: string;
  orden?: number;
  total?: number;
  aps?: string;
  ultimaVisita?: Date;
  diasSinVenir: number;
}

const mapearClienteCSVaCliente = (clienteCSV: ClienteCSV, index: number): Cliente => {
  // Convertir fecha de última visita a objeto Date si existe
  let ultimaVisita: Date | undefined = undefined;
  if (clienteCSV.ULT_VISITA) {
    // Formato esperado: DD/MM/YYYY
    const partes = clienteCSV.ULT_VISITA.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Los meses en JavaScript son 0-indexed
      const año = parseInt(partes[2], 10);
      ultimaVisita = new Date(año, mes, dia);
    }
  }

  return {
    id: index + 1, // Asignar un ID secuencial
    serie: clienteCSV.SERIE || '',
    modelo: clienteCSV.Modelo || '',
    año: clienteCSV.ANIO_VIN || 0,
    nombreFactura: clienteCSV.NOMBRE_FAC || '',
    contacto: clienteCSV.CONTACTO || '',
    agencia: clienteCSV.AGENCI || '',
    celular: clienteCSV.CELULAR ? clienteCSV.CELULAR.toString() : '',
    telefono: clienteCSV.TELEFONO ? clienteCSV.TELEFONO.toString() : undefined,
    tOficina: clienteCSV.OFICINA ? clienteCSV.OFICINA.toString() : undefined,
    cloudtalk: undefined, // No está en el CSV, se calculará después
    paquete: clienteCSV.PAQUETE ? clienteCSV.PAQUETE.toString() : undefined,
    orden: clienteCSV.ORDEN,
    total: clienteCSV.TOTAL,
    aps: clienteCSV.NOMBRE_ASESOR || '',
    ultimaVisita: ultimaVisita,
    diasSinVenir: clienteCSV.DIAS_NOSHOW || 0
  };
};

// Función para cargar datos desde un archivo CSV local
export const cargarDatosCSV = async (): Promise<Cliente[]> => {
  try {
    // Intenta por todos los medios posibles cargar el archivo
    console.log('Intentando cargar el archivo CSV...');
    
    // Forma directa (usando ruta relativa desde public)
    let response;
    
    try {
      response = await fetch('/urcsv.csv');
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    } catch (e) {
      console.error('Error al cargar el CSV desde /urcsv.csv:', e);
      
      try {
        // Alternativa 1: Ruta relativa con ./
        response = await fetch('./urcsv.csv');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      } catch (e2) {
        console.error('Error al cargar el CSV desde ./urcsv.csv:', e2);
        
        try {
          // Alternativa 2: Ruta sin / inicial
          response = await fetch('urcsv.csv');
          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        } catch (e3) {
          console.error('Error al cargar el CSV desde urcsv.csv:', e3);
          
          // Si estamos usando Vite, intentar con la carpeta assets
          try {
            response = await fetch('/src/assets/urcsv.csv');
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
          } catch (e4) {
            console.error('Error al cargar el CSV desde /src/assets/urcsv.csv:', e4);
            throw new Error('No se pudo cargar el archivo CSV desde ninguna ubicación');
          }
        }
      }
    }
    
    // Si llegamos aquí, tenemos una respuesta válida
    console.log('Archivo CSV cargado exitosamente.');
    const csvText = await response.text();
    
    // Verificar que el contenido sea realmente un CSV y no un HTML
    if (csvText.trim().startsWith('<!doctype html>') || csvText.trim().startsWith('<html>')) {
      console.error('El contenido devuelto es HTML, no un CSV');
      throw new Error('El contenido devuelto es HTML, no un CSV');
    }
    
    console.log('Primeros 200 caracteres del CSV:', csvText.substring(0, 200));
    
    // Parsear el CSV con PapaParse
    const resultado = await new Promise<Papa.ParseResult<ClienteCSV>>((resolve, reject) => {
      Papa.parse<ClienteCSV>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          console.log(`CSV parseado exitosamente. ${result.data.length} filas encontradas.`);
          resolve(result);
        },
        error: (error: any) => {
          console.error('Error al parsear el CSV:', error);
          reject(error);
        }
      });
    });
    
    // Verificar si hay datos
    if (resultado.data.length === 0) {
      console.error('El CSV se parseó correctamente pero no contiene datos.');
      throw new Error('El CSV no contiene datos');
    }
    
    // Mapear los datos CSV al formato Cliente
    const clientes = resultado.data
      .filter(row => row.SERIE) // Filtrar filas sin serie
      .map(mapearClienteCSVaCliente);
    
    console.log(`Se han mapeado ${clientes.length} registros de clientes.`);
    return clientes;
  } catch (error) {
    console.error('Error final al cargar o procesar el CSV:', error);
    
    // En lugar de devolver datos de ejemplo, lanzamos el error para manejarlo en la UI
    throw error;
  }
};