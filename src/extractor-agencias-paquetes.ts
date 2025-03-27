import Papa from 'papaparse';

// Interfaz ClienteCSV para datos del CSV
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

// VERSIÓN MEJORADA: Extraer todas las agencias y paquetes disponibles en el CSV
export const extraerAgenciasYPaquetesCompletos = async (): Promise<{
  agencias: string[];
  paquetes: string[];
  totalRegistros: number;
}> => {
  try {
    console.log('👉 INICIO: Extracción completa de agencias y paquetes...');
    
    // Rutas a intentar para buscar el archivo CSV
    const rutas = [
      '/urcsv.csv',
      './urcsv.csv',
      'urcsv.csv',
      '/src/assets/urcsv.csv',
      '../urcsv.csv',
      'assets/urcsv.csv',
      // Añadimos más rutas alternativas
      'public/urcsv.csv',
      './public/urcsv.csv',
      '../public/urcsv.csv',
      'data/urcsv.csv',
      './data/urcsv.csv'
    ];
    
    console.log('Intentando cargar CSV desde rutas:', rutas);
    
    // Intentar cargar desde cada ruta
    let csvText = '';
    let rutaExitosa = '';
    
    for (const ruta of rutas) {
      try {
        console.log(`Intentando cargar desde: ${ruta}`);
        const response = await fetch(ruta, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          csvText = await response.text();
          rutaExitosa = ruta;
          console.log(`✅ CSV cargado correctamente desde ${ruta}`);
          console.log(`Primeros 200 caracteres: ${csvText.substring(0, 200)}...`);
          break;
        }
      } catch (e: any) {
        console.error(`❌ Error al cargar desde ${ruta}:`, e);
      }
    }
    
    if (!csvText) {
      console.error('❌ No se pudo cargar el archivo CSV desde ninguna ubicación');
      throw new Error(`No se pudo cargar el archivo CSV desde ninguna ubicación. Rutas intentadas: ${rutas.join(', ')}`);
    }
    
    // Verificar que el contenido sea realmente un CSV
    if (csvText.trim().startsWith('<!doctype html>') || csvText.trim().startsWith('<html>')) {
      console.error('❌ El contenido devuelto es HTML, no un CSV');
      throw new Error(`El contenido devuelto es HTML, no un CSV. Ruta: ${rutaExitosa}`);
    }
    
    console.log(`Procesando CSV con aproximadamente ${csvText.length} caracteres`);
    
    // Parsear el CSV con PapaParse
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore: Ignoramos errores de tipo en la configuración de Papa.parse
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: false, // Mantener strings originales
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(), // Eliminar espacios en encabezados
          complete: (result) => {
            if (result.errors && result.errors.length > 0) {
              console.warn('⚠️ CSV parseado con errores:', result.errors);
            }
            
            console.log(`CSV parseado con ${result.data.length} filas y ${result.meta.fields?.length || 0} columnas`);
            console.log('Encabezados detectados:', result.meta.fields);
            
            // Para depuración, mostrar las primeras filas
            console.log('Primeras 3 filas de muestra:');
            result.data.slice(0, 3).forEach((row: any, idx: number) => {
              console.log(`Fila ${idx + 1}:`, row);
            });
            
            // Extraer agencias únicas
            const agenciasSet = new Set<string>();
            // Extraer paquetes únicos
            const paquetesSet = new Set<string>();
            
            // Recorrer todos los datos
            let contadorFilasValidas = 0;
            result.data.forEach((row: any, idx: number) => {
              if (!row || typeof row !== 'object') {
                console.warn(`⚠️ Fila ${idx} no es un objeto válido:`, row);
                return;
              }
              
              contadorFilasValidas++;
              
              // Buscar la columna de agencia - puede ser AGENCI o Agencia
              if (row.AGENCI) {
                agenciasSet.add(String(row.AGENCI).trim());
              } else if (row.Agencia) {
                agenciasSet.add(String(row.Agencia).trim());
              } else if (row.agencia) {
                agenciasSet.add(String(row.agencia).trim());
              }
              
              // Buscar la columna de paquete - puede ser PAQUETE o Paquete
              if (row.PAQUETE) {
                paquetesSet.add(String(row.PAQUETE).trim() || 'null');
              } else if (row.Paquete) {
                paquetesSet.add(String(row.Paquete).trim() || 'null');
              } else if (row.paquete) {
                paquetesSet.add(String(row.paquete).trim() || 'null');
              } else {
                // Si no hay paquete, añadir 'null' para consistencia
                paquetesSet.add('null');
              }
            });
            
            console.log(`Procesadas ${contadorFilasValidas} filas válidas de ${result.data.length} totales`);
            
            // Convertir sets a arrays y ordenar
            const agencias = Array.from(agenciasSet).filter(a => a).sort();
            const paquetes = Array.from(paquetesSet).filter(p => p).sort();
            
            console.log(`✅ EXTRACCIÓN COMPLETA: Encontradas ${agencias.length} agencias y ${paquetes.length} paquetes únicos.`);
            console.log('Todas las agencias encontradas:', agencias);
            console.log('Todos los paquetes encontrados:', paquetes);
            
            // Resolver con los datos extraídos
            resolve({
              agencias,
              paquetes,
              totalRegistros: result.data.length
            });
          },
          error: (error: any) => {
            console.error('❌ Error al parsear el CSV:', error);
            reject(error);
          }
        });
      } catch (parseError: any) {
        console.error('❌ Error grave durante el parseo del CSV:', parseError);
        reject(parseError);
      }
    });
  } catch (error: any) {
    console.error('❌ Error en la extracción:', error);
    throw error;
  }
};