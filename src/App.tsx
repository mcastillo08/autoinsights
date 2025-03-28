import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Calendar } from 'lucide-react';
import DiasSinVisitaRangeSlider from './DiasSinVisitaRangeSlider';
import { obtenerClientesPaginados, Cliente, limpiarCacheCSV, obtenerMetadatosFiltros } from './CsvDataService';
import FiltroPorSerieAvanzado from './components/FiltroPorSerieAvanzado';
import { obtenerHistorialBusquedas, guardarEnHistorial } from './service/HistorialBusquedas';
import { debounce } from 'lodash';
import FilterLoader from './FilterLoader';


type AgenciasType = {
  [key: string]: boolean;
};

type PaquetesType = {
  [key: string]: boolean;
};

type APSType = {
  [key: string]: boolean;
};

const modelosNissan = [
  'VERSA',
  'NP300',
  'SENTRA',
  'MARCH',
  'TSURU',
  'TIIDA',
  'FRONTIER',
  'X-TRAIL',
  'ALTIMA',
  'PATHFINDER',
  'URVAN',
  'NV350',
  'TITAN',
  'KICKS',
  'ROGUE',
  'NOTE',
  'MAXIMA',
  'JUKE',
  'NV2500',
  'ARMADA',
  'MURANO',
  'CABSTAR',
  '240SX'
];

// Lista de años modelo
const añosModelo = [
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  '2014'
];

// Lista de asesores APS
const asesorAPS = [
  'APS VIRTUAL',
  'AARON ALFARO COTA',
  'AARON VASQUEZ',
  'ABELARDO MOLINA V.',
  'ABELARDO MOLINA VALDEZ',
  'ABRAHAM GUERRERO M.',
  'ALBERTO VAZQUEZ MARTINEZ',
  'ALDO FRANCISCO GUTIERREZ VAZ...',
  'ALEJANDRA ABIGAIL MORENO',
  'ALEXIS GARCIA',
  'ANA CRISTINA BONILLA ESCOBAR',
  'APS VIRTUAL',
  'ARMANDO RIVERA PIRI',
  'ASESOR VIRTUAL',
  'ASESOR VIRTUAL MAG',
  'BERNARDO HODA...',
  'BRENDA JOSELYN CORONEL LOPEZ',
  'CARLOS HECTOR RUBIO RUIZ',
  'CARLOS RUBIO',
  'CINTHIA MUNGUIA NUNEZ',
  'CLAUDIA ANGELICA MARTINEZ JIM...',
  'CUAHUTEMOC GALINDO LEOS',
  'DAGOBERTO DOMINGUEZ DURAN',
  'DAVID ENRIQUE HERNANDEZ CAMP...',
  'DENISSE SAIZA URIAS',
  'DEYANIRA ELIZABETH RODRIGUEZ',
  'DIANA ZULEMA',
  'DULCE BERENICE ALTAMIRANO OL...',
  'DULCE MELYNA SILVA LEYVA',
  'EDUARDO COBOS MARTINEZ',
  'ENRIQUE MORENO PRECIADO',
  'ESTHEFANIA INDA BRACAMONTES',
  'FABIAN LOPEZ PALOMARES',
  'FERNANDO ENRIQUE GARCIA BUITI...',
  'FRANCISCA SINIA SOTO JIMENEZ',
  'FRANCISCO DE JESUS NAVARRO G...',
  'FRANCISCO JAVIER VALLES VARGAS',
  'FRANCISCO ROMAN GARCIA PARE...',
  'FRANCYS FIGUEROA SANTACRUZ',
  'GABRIEL ANGULO RIOS',
  'GRECIA CHAVEZ TAPIA',
  'GRECIA KAROLINA VALADEZ HERDEZ',
  'GRECIA KAROLINA VALADEZ HERN...',
  'GUADALUPE ARAGON PARRA',
  'HECTOR NOE HERNANDEZ MORENO',
  'HECTOR SALVADOR RODRIGUEZ VA...',
  'HOMAR ALEJANDRO OLIVAS QUIN...',
  'HOMAR ALEJANDRO OLIVAS QUINT...',
  'HUGO RUIZ NAVARRETE',
  'JAQUELINE MENDOZA RODRIGUEZ',
  'JESUS EDUARDO MENDEZ MENA',
  'JESUS LEONARDO LOPEZ FUENTES',
  'JHOSELYN NATHALY BELTRAN FLOR...',
  'JORGE CORDOVA',
  'JOSE ANTONIO SANCHEZ ALVARAD...',
  'JOSE DE JESUS MIRANDA NAVARRO',
  'JOSE LUIS LUJAN APARICIO',
  'JOSGAR OBED LOPEZ FUENTES',
  'JUAN CARLOS LEON',
  'JUAN JESUS GALVEZ MONTANO',
  'JUAN JESUS GALVEZ MONTAñO',
  'JUDITH MILAGROS GALLEGOS MO...',
  'KAREN RIVERA ROMAN',
  'KARIME JAIDAR AVILA',
  'LEONARDO ALBERTO PALOMARES',
  'LISSETH LOPEZ MARTINEZ',
  'LIZETH VALENCIA MENDEZ',
  'LUCIA FAUSTO MEDINA',
  'LUIS ALBERTO TAPIA ACOSTA',
  'LUIS ANGEL FISHER ESCOBEDO',
  'MARCO ANTONIO MENDEZ VALDEZ',
  'MARIA GABRIELA CASTILLO ROSAS',
  'MARIA GLORIA GPE RAMIREZ LOPEZ',
  'MARIA ISABEL CELAYA VEGA',
  'MARITZA MARTINEZ FRASQUILLO',
  'MARLENE LOPEZ LAURO',
  'MARTIN EDUARDO BAY ARELLANO',
  'MAYRA JAQUELINE GARIBAY FELIX',
  'MIGUEL ANGEL CORDOVA LEON',
  'MILEYDI MERLIN ARAUJO MANRIQU...',
  'NALLELY LOPEZ',
  'NOELIA GUADALUPE TANORI CABR...',
  'NOELIA GUADALUPE TANORI CABREA',
  'ODALYS GABRIELA YANEZ MIRANDA',
  'ODALYS YANEZ',
  'PAOLA FELIX RUBIO',
  'PAUL RUELAS SOSA',
  'RAMON SERVANDO RUIZ ESQUER',
  'RICARDO HERNANDEZ',
  'RICARDO MORENO OBESO',
  'RODRIGO GARCIA REYES',
  'ROSA ANDREA DURAZO AVALOS',
  'RUBI ADILENE FLORES ESTRELLA',
  'SANDRA PATRICIA VELDUCEA DIAZ',
  'SAUL ISAC LIZARRAGA MEZA',
  'SERGIO FIGUEROA',
  'TERESA EVANGELINA GASTELUM BA...',
  'TERESA ITZEL SERRANO JARILLO',
  'VANNIA TERESITA MENDEZ MENDO...',
  'VERONICA GISSELLE SALAS GUZM...',
  'VICTOR ESTEBAN SALAZAR FLORES',
  'YEIMI KAROL LARA FERREYRA',
  'YESENIA MAZON',
  'YESSENIA MAZON',
  'YEZENIA RIVAS AMAYA'
];


const formatearNumeroTelefonoParaMostrar = (numero?: string): string => {
  if (!numero || numero.trim() === '') {
    return '-';
  }

  // Si el número está en notación científica, convertirlo a formato normal
  if (numero.includes('E') || numero.includes('e')) {
    try {
      // Convertir de notación científica a número normal sin decimales
      const num = Number(numero);
      if (isNaN(num)) {
        return numero; // Si no se puede convertir, devolver el original
      }
      return num.toFixed(0); // Convertir a string sin decimales
    } catch (e) {
      console.error('Error al convertir número de notación científica:', e);
      return numero; // Devolver el original si hay error
    }
  }

  return numero;
};

// Función para verificar si un campo está vacío o solo contiene espacios
const isEmpty = (value?: string): boolean => {
  return !value || value.trim() === '';
};
// Función  para determinar el número de Cloudtalk
const determinaCloudTalk = (cliente: Cliente): string => {
  // Verificar celular primero
  if (!isEmpty(cliente.celular)) {
    const celularFormateado = formatearNumeroTelefonoParaMostrar(cliente.celular);
    return celularFormateado !== '-' ? `+${celularFormateado}` : '-';
  }

  // Si no hay celular, verificar teléfono
  if (!isEmpty(cliente.telefono)) {
    const telefonoFormateado = formatearNumeroTelefonoParaMostrar(cliente.telefono);
    return telefonoFormateado !== '-' ? `+${telefonoFormateado}` : '-';
  }

  // Si no hay teléfono, verificar T. oficina
  if (!isEmpty(cliente.tOficina)) {
    const oficinaFormateado = formatearNumeroTelefonoParaMostrar(cliente.tOficina);
    return oficinaFormateado !== '-' ? `+${oficinaFormateado}` : '-';
  }

  // Si no hay ninguno, mostrar guión
  return '-';
};

const formatearFechaTabla = (fecha: Date): string => {
  if (!fecha || isNaN(fecha.getTime())) return "-";

  const dia = fecha.getDate();
  const mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${dia} ${mes} ${año}`;
};

function App() {
  // Estados para la carga de datos
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mostrarFiltroAgencia, setMostrarFiltroAgencia] = useState<boolean>(false);
  const [mostrarFiltroModelo, setMostrarFiltroModelo] = useState<boolean>(false);
  const [mostrarFiltroAño, setMostrarFiltroAño] = useState<boolean>(false);
  const [posicionMenu, setPosicionMenu] = useState({ top: 0, left: 0, width: 0 });
  const [mostrarFiltroPaquete, setMostrarFiltroPaquete] = useState<boolean>(false);
  const [mostrarFiltroAPS, setMostrarFiltroAPS] = useState<boolean>(false);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState<string[]>([]);
  const [agenciasDisponibles, setAgenciasDisponibles] = useState<string[]>([]);
  const [agenciasSeleccionadas, setAgenciasSeleccionadas] = useState<AgenciasType>(() => ({}));
  const [historialBusquedas, setHistorialBusquedas] = useState<string[]>([]);

  // estados de boton siguiente y anterior
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 500;

  const [cargandoPagina, setCargandoPagina] = useState<boolean>(false);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);
  // Por estas correctas:
  const [minDiasSinVisita, setMinDiasSinVisita] = useState<number>(0);
  const [maxDiasSinVisita, setMaxDiasSinVisita] = useState<number>(4800);

  // Agregar estos estados junto a los demás estados al inicio de la función App()
  const [filtroNombreFactura, setFiltroNombreFactura] = useState<string>('');
  const [filtroCelular, setFiltroCelular] = useState<string>('');
  // estados de la base de datos .CSV 
  const [clientesData, setClientesData] = useState<Cliente[]>([]);
  // Estados para el calendario
  const [mostrarCalendario, setMostrarCalendario] = useState<boolean>(false);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mesInicio, setMesInicio] = useState<Date>(new Date());
  const [mesFin, setMesFin] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1));
  const [seleccionandoInicio, setSeleccionandoInicio] = useState<boolean>(true);
  const [mostrarSelectorMesInicio, setMostrarSelectorMesInicio] = useState<boolean>(false);
  const [mostrarSelectorMesFin, setMostrarSelectorMesFin] = useState<boolean>(false);
  const [selectorAñoInicio, setSelectorAñoInicio] = useState<number>(new Date().getFullYear());
  const [selectorAñoFin, setSelectorAñoFin] = useState<number>(new Date().getFullYear());
  const [todosLosDatosCargados, setTodosLosDatosCargados] = useState<boolean>(false);




  // Función para cargar datos paginados
  const cargarDatosPaginados = useCallback(async (pagina: number) => {
    setCargandoPagina(true);
    try {
      console.log(`Cargando todos los datos del CSV...`);
      // Se cambia el parámetro precargaCompleta a true para cargar todos los datos
      const resultado = await obtenerClientesPaginados(pagina, itemsPerPage, true);

      // Guardamos todos los datos en el estado
      setClientesData(resultado.clientes);
      setTotalRegistros(resultado.total);
      setTodosLosDatosCargados(true);

      // Actualizar filtros con todos los datos disponibles
      if (resultado.clientes.length > 0) {
        // Extraer agencias únicas
        const agencias = Array.from(new Set(resultado.clientes.map(cliente => cliente.agencia)))
          .filter(agencia => agencia)
          .sort();
        setAgenciasDisponibles(agencias);

        // Inicializar los checkboxes de agencias
        const agenciasObj: AgenciasType = {};
        agencias.forEach(agencia => {
          if (agencia) {
            agenciasObj[agencia] = true;
          }
        });
        setAgenciasSeleccionadas(agenciasObj);

        // Extraer paquetes únicos
        const paquetes = Array.from(new Set(resultado.clientes.map(cliente => cliente.paquete || 'null')))
          .filter(paquete => paquete)
          .sort();
        setPaquetesDisponibles(paquetes);

        // Inicializar checkboxes de paquetes
        const paquetesObj: PaquetesType = {};
        paquetes.forEach(paquete => {
          if (paquete) {
            paquetesObj[paquete] = true;
          }
        });
        setPaquetesSeleccionados(paquetesObj);
      }

      console.log(`Cargados ${resultado.clientes.length} registros de ${resultado.total} totales`);
      return true;
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setErrorCarga(error instanceof Error ? error.message : 'Error desconocido al cargar datos');
      return false;
    } finally {
      setCargandoPagina(false);
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const inicializarDatos = async () => {
      setIsLoading(true);
      setErrorCarga(null);
      try {
        // Primero cargar los metadatos para los filtros
        console.log('Cargando metadatos de filtros...');
        const metadatos = await obtenerMetadatosFiltros();

        console.log('Metadatos obtenidos:', {
          agencias: metadatos.agencias.length,
          modelos: metadatos.modelos.length,
          años: metadatos.años.length,
          paquetes: metadatos.paquetes.length
        });

        // Actualizar los estados con los metadatos completos
        setAgenciasDisponibles(metadatos.agencias);

        // Inicializar los checkboxes con todos los valores activados
        const agenciasObj: AgenciasType = {};
        metadatos.agencias.forEach(agencia => {
          if (agencia) { // Asegurarse de que no es undefined o ""
            agenciasObj[agencia] = true;
          }
        });
        setAgenciasSeleccionadas(agenciasObj);

        // Actualizar paquetes disponibles
        setPaquetesDisponibles(metadatos.paquetes);

        // Inicializar checkboxes de paquetes
        const paquetesObj: PaquetesType = {};
        metadatos.paquetes.forEach(paquete => {
          if (paquete) {
            paquetesObj[paquete] = true;
          }
        });
        setPaquetesSeleccionados(paquetesObj);

        // Ahora cargar todos los datos
        await cargarDatosPaginados(1);

      } catch (error) {
        console.error('Error al inicializar datos:', error);
        setErrorCarga(error instanceof Error ? error.message : 'Error desconocido al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    if (!todosLosDatosCargados) {
      inicializarDatos();
    }
  }, [cargarDatosPaginados, todosLosDatosCargados]);



  useEffect(() => {
    if (agenciasDisponibles.length > 0) {
      console.log("agenciasDisponibles cambió:", agenciasDisponibles.length);

      // Forzar actualización de agenciasSeleccionadas cuando cambia agenciasDisponibles
      const agenciasObj: AgenciasType = {};
      agenciasDisponibles.forEach(agencia => {
        if (agencia) {
          agenciasObj[agencia] = true;
        }
      });

      // Actualizar el estado solo si hay nuevas agencias o si la cantidad es diferente
      if (Object.keys(agenciasObj).length !== Object.keys(agenciasSeleccionadas).length) {
        console.log("Actualizando agenciasSeleccionadas con nuevos valores:", Object.keys(agenciasObj).length);
        setAgenciasSeleccionadas(agenciasObj);
      } else {
        // Verificar si alguna agencia en agenciasDisponibles no existe en agenciasSeleccionadas
        const nuevaAgenciaDetectada = agenciasDisponibles.some(agencia => !agenciasSeleccionadas.hasOwnProperty(agencia));
        if (nuevaAgenciaDetectada) {
          console.log("Detectada nueva agencia en agenciasDisponibles, actualizando agenciasSeleccionadas");
          setAgenciasSeleccionadas(agenciasObj);
        }
      }
    }
  }, [agenciasDisponibles, agenciasSeleccionadas]); // Dependencias actualizadas



  useEffect(() => {
    setHistorialBusquedas(obtenerHistorialBusquedas());
  }, []);

  const addToSearchHistory = (term: string) => {
    const nuevoHistorial = guardarEnHistorial(term);
    setHistorialBusquedas(nuevoHistorial);
  };

  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
    }, 300), // 300ms de retraso
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // Función para realizar búsqueda inmediata (sin debounce)
  const handleSearch = () => {
    if (searchTerm.trim()) {
      addToSearchHistory(searchTerm.trim());
    }
  };

  // Inicializar el estado de los asesores APS seleccionados
  const [apsSeleccionados, setAPSSeleccionados] = useState<APSType>(() => {
    const inicial: APSType = {};
    asesorAPS.forEach(aps => {
      inicial[aps] = true;
    });
    return inicial;
  });



  useEffect(() => {
    if (clientesData.length > 0) {
      // Obtener agencias únicas del CSV
      const agencias = Array.from(new Set(clientesData.map(cliente => cliente.agencia)))
        .filter(agencia => agencia)
        .sort();
      setAgenciasDisponibles(agencias);

      // Inicializar los checkboxes de agencias
      const agenciasObj: AgenciasType = {};
      agencias.forEach(agencia => {
        agenciasObj[agencia] = true;
      });
      setAgenciasSeleccionadas(agenciasObj);

      // Obtener paquetes únicos del CSV
      const paquetes = Array.from(new Set(clientesData.map(cliente =>
        cliente.paquete !== undefined ? cliente.paquete : 'null'
      )))
        .filter(paquete => paquete !== undefined)
        .sort();

      // Verificamos si hay paquetes duplicados debido a conversión numérica
      console.log('Paquetes únicos encontrados:', paquetes);

      setPaquetesDisponibles(paquetes);

      // Inicializar los checkboxes de paquetes
      const paquetesObj: PaquetesType = {};
      paquetes.forEach(paquete => {
        paquetesObj[paquete] = true;
      });
      setPaquetesSeleccionados(paquetesObj);
    }
  }, [clientesData]);

  // Inicializar el estado de los paquetes seleccionados
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState<PaquetesType>(() => {
    const inicial: PaquetesType = {};
    paquetesDisponibles.forEach(paquete => {
      inicial[paquete] = true;
    });
    return inicial;
  });

  // Estado para los modelos seleccionados
  const [modelosSeleccionados, setModelosSeleccionados] = useState<{ [key: string]: boolean }>(() => {
    const inicial: { [key: string]: boolean } = {};
    modelosNissan.forEach(modelo => {
      inicial[modelo] = true;
    });
    return inicial;
  });

  // Estado para los años seleccionados
  const [añosSeleccionados, setAñosSeleccionados] = useState<{ [key: string]: boolean }>(() => {
    const inicial: { [key: string]: boolean } = {};
    añosModelo.forEach(año => {
      inicial[año] = true;
    });
    return inicial;
  });

  // Función optimizada para detectar filtros activos
  const hayFiltrosActivos = (): boolean => {
    // Comprobar filtros directos de manera rápida
    if (searchTerm.trim() !== '' ||
      filtroNombreFactura.trim() !== '' ||
      filtroCelular.trim() !== '' ||
      fechaInicio !== null ||
      fechaFin !== null ||
      minDiasSinVisita > 0 ||
      maxDiasSinVisita < 4800) {
      return true;
    }

    // Comprobar filtros de checkboxes
    // Uso de Array.some() para optimizar la detección de filtros no seleccionados
    if (Object.values(agenciasSeleccionadas).some(v => !v) ||
      Object.values(modelosSeleccionados).some(v => !v) ||
      Object.values(añosSeleccionados).some(v => !v) ||
      Object.values(paquetesSeleccionados).some(v => !v) ||
      Object.values(apsSeleccionados).some(v => !v)) {
      return true;
    }

    return false;
  };

  // Función handlePageChange mejorada
  const handlePageChange = (newPage: number) => {
    // Evitar procesamiento si ya está cargando
    if (cargandoPagina) return;
    setIsFiltering(true);

    console.log(`Cambiando a página ${newPage}`);

    // Verificar si hay filtros activos
    const tieneFiltrosaActivos = hayFiltrosActivos();

    // Si hay filtros activos, trabajamos con los datos filtrados
    if (tieneFiltrosaActivos) {
      const totalPaginas = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

      // Verificar que la página solicitada no exceda el total de páginas disponibles
      if (newPage > totalPaginas) {
        console.log(`La página solicitada (${newPage}) excede el total disponible (${totalPaginas})`);
        // Opcionalmente podrías establecer la página al máximo disponible
        setCurrentPage(totalPaginas);
        return;
      }

      // Si estamos en rango, simplemente cambiamos la página
      setCurrentPage(newPage);
      return;
    }

    // Si no hay filtros activos, simplemente cambiamos la página
    // ya que todos los datos ya están cargados
    setCurrentPage(newPage);
  };

  const resetearFiltros = () => {
    setIsFiltering(true);
    // Resetear filtro de búsqueda por serie
    setSearchTerm('');

    // Resetear filtro de nombre de factura
    setFiltroNombreFactura('');

    // Resetear filtro de celular
    setFiltroCelular('');

    // Resetear rango de días sin visita
    setMinDiasSinVisita(0);
    setMaxDiasSinVisita(250);

    // Resetear fechas
    setFechaInicio(null);
    setFechaFin(null);

    // Resetear paginación
    setCurrentPage(1);

    // Resetear filtros de checkboxes
    // Agencias
    const resetAgencias: AgenciasType = {};
    agenciasDisponibles.forEach(agencia => {
      resetAgencias[agencia] = true;
    });
    setAgenciasSeleccionadas(resetAgencias);

    // Modelos
    const resetModelos: { [key: string]: boolean } = {};
    modelosNissan.forEach(modelo => {
      resetModelos[modelo] = true;
    });
    setModelosSeleccionados(resetModelos);

    // Años
    const resetAños: { [key: string]: boolean } = {};
    añosModelo.forEach(año => {
      resetAños[año] = true;
    });
    setAñosSeleccionados(resetAños);

    // Paquetes
    const resetPaquetes: PaquetesType = {};
    paquetesDisponibles.forEach(paquete => {
      resetPaquetes[paquete] = true;
    });
    setPaquetesSeleccionados(resetPaquetes);

    // APS
    const resetAPS: APSType = {};
    asesorAPS.forEach(aps => {
      resetAPS[aps] = true;
    });
    setAPSSeleccionados(resetAPS);

    // Cerrar cualquier filtro que esté abierto
    cerrarTodosFiltros();
  };


  // 1. Añadir al useMemo de filteredData el filtro por días sin visita

  const filteredData = useMemo(() => {
    console.time('Filtrado');

    // Mostrar loader mientras se filtra
    setIsFiltering(true);

    // Reducir la cantidad de logs para mejorar rendimiento
    // console.log("Datos antes de filtrar:", clientesData.length);

    // Variables para contar rechazos por tipo de filtro
    let rechazadosPorSerie = 0;
    let rechazadosPorFecha = 0;
    let rechazadosPorAgencia = 0;
    let rechazadosPorModelo = 0;
    let rechazadosPorAño = 0;
    let rechazadosPorPaquete = 0;
    let rechazadosPorAPS = 0;
    let rechazadosPorNombreFactura = 0;
    let rechazadosPorCelular = 0;
    let rechazadosPorDiasSinVisita = 0;

    // Lógica para buscar por múltiples series
    const seriesABuscar = searchTerm
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    // Pre-comprobación para filtros comunes para mejorar rendimiento
    const filtrarPorSerie = seriesABuscar.length > 0;
    const filtrarPorFecha = fechaInicio !== null && fechaFin !== null;
    const filtrarPorDiasSinVisita = minDiasSinVisita > 0 || maxDiasSinVisita < 4800;
    const filtrarPorNombreFactura = filtroNombreFactura.trim() !== '';
    const filtrarPorCelular = filtroCelular.trim() !== '';

    // Determinar si hay filtros de checkbox que no están todos seleccionados
    const hayFiltroAgencia = Object.values(agenciasSeleccionadas).some(v => !v);
    const hayFiltroModelo = Object.values(modelosSeleccionados).some(v => !v);
    const hayFiltroAño = Object.values(añosSeleccionados).some(v => !v);
    const hayFiltroPaquete = Object.values(paquetesSeleccionados).some(v => !v);
    const hayFiltroAPS = Object.values(apsSeleccionados).some(v => !v);

    const result = clientesData.filter(cliente => {
      // Filtro por serie
      if (filtrarPorSerie) {
        if (seriesABuscar.length > 1) {
          const serieLower = cliente.serie.toLowerCase();
          const coincideConAlguno = seriesABuscar.some(term => serieLower.includes(term));
          if (!coincideConAlguno) {
            rechazadosPorSerie++;
            return false;
          }
        } else if (!cliente.serie.toLowerCase().includes(seriesABuscar[0])) {
          rechazadosPorSerie++;
          return false;
        }
      }

      // Filtro por días sin visita - optimizado
      if (filtrarPorDiasSinVisita) {
        if (!cliente.diasSinVenir ||
          cliente.diasSinVenir < minDiasSinVisita ||
          cliente.diasSinVenir > maxDiasSinVisita) {
          rechazadosPorDiasSinVisita++;
          return false;
        }
      }

      // Filtro por fecha - versión optimizada
      if (filtrarPorFecha) {
        if (!cliente.ultimaVisita) {
          rechazadosPorFecha++;
          return false;
        }

        const inicio = new Date(fechaInicio!.getFullYear(), fechaInicio!.getMonth(), fechaInicio!.getDate());
        const fin = new Date(fechaFin!.getFullYear(), fechaFin!.getMonth(), fechaFin!.getDate());
        const fechaCliente = new Date(
          cliente.ultimaVisita.getFullYear(),
          cliente.ultimaVisita.getMonth(),
          cliente.ultimaVisita.getDate()
        );

        if (fechaCliente < inicio || fechaCliente > fin) {
          rechazadosPorFecha++;
          return false;
        }
      }

      // Filtro por agencia - optimizado
      if (hayFiltroAgencia && cliente.agencia && !agenciasSeleccionadas[cliente.agencia]) {
        rechazadosPorAgencia++;
        return false;
      }

      // Filtro por modelo - optimizado
      if (hayFiltroModelo && !modelosSeleccionados[cliente.modelo]) {
        rechazadosPorModelo++;
        return false;
      }

      // Filtro por año - optimizado
      if (hayFiltroAño && !añosSeleccionados[cliente.año.toString()]) {
        rechazadosPorAño++;
        return false;
      }

      // Filtro por paquete - optimizado
      if (hayFiltroPaquete && cliente.paquete && !paquetesSeleccionados[cliente.paquete]) {
        rechazadosPorPaquete++;
        return false;
      }

      // Filtro por APS - optimizado
      if (hayFiltroAPS && cliente.aps && !apsSeleccionados[cliente.aps]) {
        rechazadosPorAPS++;
        return false;
      }

      // Filtro por Nombre Factura - optimizado
      if (filtrarPorNombreFactura && !cliente.nombreFactura.toLowerCase().includes(filtroNombreFactura.trim().toLowerCase())) {
        rechazadosPorNombreFactura++;
        return false;
      }

      // Filtro por Celular - optimizado
      if (filtrarPorCelular) {
        const termino = filtroCelular.trim();
        const celularMatch = cliente.celular?.includes(termino) || false;
        const telefonoMatch = cliente.telefono?.includes(termino) || false;
        const oficinaMatch = cliente.tOficina?.includes(termino) || false;
        const cloudtalkMatch = determinaCloudTalk(cliente)?.includes(termino) || false;

        if (!celularMatch && !telefonoMatch && !oficinaMatch && !cloudtalkMatch) {
          rechazadosPorCelular++;
          return false;
        }
      }

      // Si pasa todos los filtros, incluir el cliente
      return true;
    });

    // Reducir verbosidad de los logs
    console.log(`Filtrado completado: ${result.length} de ${clientesData.length} registros coinciden.`);
    console.timeEnd('Filtrado');

    // Ocultar el loader después del filtrado
    setTimeout(() => {
      setIsFiltering(false);
    }, 100); // Reducir el tiempo a 100ms para mejor respuesta

    return result;
  }, [
    clientesData,
    searchTerm,
    agenciasSeleccionadas,
    modelosSeleccionados,
    añosSeleccionados,
    paquetesSeleccionados,
    apsSeleccionados,
    filtroNombreFactura,
    filtroCelular,
    fechaInicio,
    fechaFin,
    minDiasSinVisita,
    maxDiasSinVisita
  ]);

  // Luego modifica getCurrentItems para usar el dato memoizado
  // Versión mejorada de getCurrentItems
  const getCurrentItems = (): Cliente[] => {
    // Si estamos cargando, mostrar un indicador
    if (isLoading || cargandoPagina) {
      return [];
    }

    // Verificar si hay filtros activos
    const tieneFiltrosaActivos = hayFiltrosActivos();

    // Si no hay filtros activos - usamos datos paginados normales
    if (!tieneFiltrosaActivos) {
      // Asegurarse de que los índices sean válidos
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;

      // Verificar si hay suficientes datos para esta página
      if (indexOfFirstItem >= clientesData.length) {
        console.warn(`Índice fuera de rango: ${indexOfFirstItem} >= ${clientesData.length}.`);
        // Usar la última página disponible en lugar de resetear
        const ultimaPagina = Math.max(1, Math.ceil(clientesData.length / itemsPerPage));
        const nuevoInicio = (ultimaPagina - 1) * itemsPerPage;
        return clientesData.slice(nuevoInicio, nuevoInicio + itemsPerPage);
      }

      return clientesData.slice(indexOfFirstItem, indexOfLastItem);
    }

    // Si hay filtros activos - trabajar con los datos filtrados
    // Los índices para la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Verificar que hay datos filtrados
    if (filteredData.length === 0) {
      return []; // No hay datos que mostrar
    }

    // Verificar que los índices son válidos
    if (indexOfFirstItem >= filteredData.length) {
      console.warn(`Índice filtrado fuera de rango: ${indexOfFirstItem} >= ${filteredData.length}.`);
      // Usar la última página disponible en lugar de resetear
      const ultimaPagina = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
      const nuevoInicio = (ultimaPagina - 1) * itemsPerPage;
      return filteredData.slice(nuevoInicio, Math.min(nuevoInicio + itemsPerPage, filteredData.length));
    }

    // Devolver los elementos para la página actual
    return filteredData.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredData.length));
  };

  // Función para manejar los cambios en los checkboxes de paquete
  const handlePaqueteCheckbox = (paquete: string) => {
    setIsFiltering(true);
    setPaquetesSeleccionados(prev => ({
      ...prev,
      [paquete]: !prev[paquete]
    }));
  };

  // Manejador para checkboxes de APS
  const handleAPSCheckbox = (aps: string) => {
    setIsFiltering(true);
    setAPSSeleccionados(prev => ({
      ...prev,
      [aps]: !prev[aps]
    }));
  };


  // Función para seleccionar solamente un APS
  const handleSolamenteAPS = (aps: string) => {
    setIsFiltering(true);
    const nuevosAPS: APSType = {};
    Object.keys(apsSeleccionados).forEach(key => {
      nuevosAPS[key] = key === aps;
    });
    setAPSSeleccionados(nuevosAPS);
  };

  // Manejador para seleccionar solamente un paquete
  const handleSolamentePaquete = (paquete: string) => {
    setIsFiltering(true);
    const nuevosPaquetes: PaquetesType = {};
    Object.keys(paquetesSeleccionados).forEach(key => {
      nuevosPaquetes[key] = key === paquete;
    });
    setPaquetesSeleccionados(nuevosPaquetes);
  };

  // Función para manejar los cambios en los checkboxes de agencia
  const handleAgenciaCheckbox = (agencia: string) => {
    setIsFiltering(true);
    setAgenciasSeleccionadas(prev => ({
      ...prev,
      [agencia]: !prev[agencia]
    }));
  };

  // Manejador para checkboxes de modelo
  const handleModeloCheckbox = (modelo: string) => {
    setIsFiltering(true);
    setModelosSeleccionados(prev => ({
      ...prev,
      [modelo]: !prev[modelo]
    }));
  };

  // Función para manejar los checkboxes de año modelo
  const handleAñoCheckbox = (año: string) => {
    setIsFiltering(true);
    setAñosSeleccionados(prev => ({
      ...prev,
      [año]: !prev[año]
    }));
  };


  // Función para manejar cambios en el input del nombre de factura
  const handleNombreFacturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroNombreFactura(e.target.value);
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroCelular(e.target.value);
  };

  const handleDiasSinVisitaRangeChange = (min: number, max: number) => {
    // No mostrar el loader para cada tecla presionada, solo al aplicar el filtro

    // Si los valores son los mismos que ya tenemos, no hacer nada
    if (min === minDiasSinVisita && max === maxDiasSinVisita) {
      return;
    }

    // Caso especial: si ambos valores son 0, mostrar todos los registros
    if (min === 0 && max === 0) {
      setIsFiltering(true);
      setMinDiasSinVisita(0);
      setMaxDiasSinVisita(4800);
    } else {
      setIsFiltering(true);
      setMinDiasSinVisita(min);
      setMaxDiasSinVisita(max);
    }
  };

  // Cerrar todos los filtros
  const cerrarTodosFiltros = () => {
    setMostrarFiltroAgencia(false);
    setMostrarFiltroModelo(false);
    setMostrarFiltroAño(false);
    setMostrarFiltroPaquete(false);
    setMostrarFiltroAPS(false);
    setMostrarCalendario(false);
  };

  // Función para mostrar/ocultar el filtro de paquetes
  const toggleFiltroPaquete = (e: React.MouseEvent<HTMLButtonElement>) => {
    const botonRect = e.currentTarget.getBoundingClientRect();

    // Calcular la posición óptima para el menú
    setPosicionMenu({
      top: botonRect.bottom + window.scrollY,
      left: botonRect.left + window.scrollX,
      width: botonRect.width
    });

    // Cerrar otros filtros si están abiertos
    cerrarTodosFiltros();

    setMostrarFiltroPaquete(!mostrarFiltroPaquete);
  };

  // Función para mostrar/ocultar el filtro de APS
  const toggleFiltroAPS = (e: React.MouseEvent<HTMLButtonElement>) => {
    const botonRect = e.currentTarget.getBoundingClientRect();

    // Calcular la posición óptima para el menú
    setPosicionMenu({
      top: botonRect.bottom + window.scrollY,
      left: botonRect.left + window.scrollX,
      width: botonRect.width
    });

    // Cerrar otros filtros si están abiertos
    cerrarTodosFiltros();

    setMostrarFiltroAPS(!mostrarFiltroAPS);
  };

  const handleSolamenteAgencia = (agencia: string) => {
    const nuevasAgencias: AgenciasType = {};
    Object.keys(agenciasSeleccionadas).forEach(key => {
      nuevasAgencias[key] = key === agencia;
    });
    setAgenciasSeleccionadas(nuevasAgencias);
  };

  // Función para seleccionar solamente un modelo
  const handleSolamenteModelo = (modelo: string) => {
    const nuevosModelos: { [key: string]: boolean } = {};
    Object.keys(modelosSeleccionados).forEach(key => {
      nuevosModelos[key] = key === modelo;
    });
    setModelosSeleccionados(nuevosModelos);
  };

  // Función para seleccionar solamente un año
  const handleSolamenteAño = (año: string) => {
    const nuevosAños: { [key: string]: boolean } = {};
    Object.keys(añosSeleccionados).forEach(key => {
      nuevosAños[key] = key === año;
    });
    setAñosSeleccionados(nuevosAños);
  };

  // Función para mostrar/ocultar el filtro de agencias
  const toggleFiltroAgencia = (e: React.MouseEvent<HTMLButtonElement>) => {
    const botonRect = e.currentTarget.getBoundingClientRect();

    // Calcular la posición óptima para el menú
    setPosicionMenu({
      top: botonRect.bottom + window.scrollY,
      left: botonRect.left + window.scrollX,
      width: botonRect.width
    });

    // Cerrar otros filtros si están abiertos
    if (mostrarFiltroModelo) {
      setMostrarFiltroModelo(false);
    }
    if (mostrarFiltroAño) {
      setMostrarFiltroAño(false);
    }

    setMostrarFiltroAgencia(!mostrarFiltroAgencia);
  };

  // Función para mostrar/ocultar el filtro de modelos
  const toggleFiltroModelo = (e: React.MouseEvent<HTMLButtonElement>) => {
    const botonRect = e.currentTarget.getBoundingClientRect();

    // Calcular la posición óptima para el menú
    setPosicionMenu({
      top: botonRect.bottom + window.scrollY,
      left: botonRect.left + window.scrollX,
      width: botonRect.width
    });

    // Cerrar otros filtros si están abiertos
    if (mostrarFiltroAgencia) {
      setMostrarFiltroAgencia(false);
    }
    if (mostrarFiltroAño) {
      setMostrarFiltroAño(false);
    }

    setMostrarFiltroModelo(!mostrarFiltroModelo);
  };

  // Función para mostrar/ocultar el filtro de años
  const toggleFiltroAño = (e: React.MouseEvent<HTMLButtonElement>) => {
    const botonRect = e.currentTarget.getBoundingClientRect();

    // Calcular la posición óptima para el menú
    setPosicionMenu({
      top: botonRect.bottom + window.scrollY,
      left: botonRect.left + window.scrollX,
      width: botonRect.width
    });

    // Cerrar otros filtros si están abiertos
    if (mostrarFiltroAgencia) {
      setMostrarFiltroAgencia(false);
    }
    if (mostrarFiltroModelo) {
      setMostrarFiltroModelo(false);
    }

    setMostrarFiltroAño(!mostrarFiltroAño);
  };


  // Función para mostrar/ocultar el calendario
  const toggleCalendario = (e: React.MouseEvent<HTMLButtonElement>) => {
    const botonRect = e.currentTarget.getBoundingClientRect();

    // Calcular la posición óptima para el menú
    setPosicionMenu({
      top: botonRect.bottom + window.scrollY,
      left: botonRect.left + window.scrollX,
      width: botonRect.width * 2 // Hacemos el calendario más ancho
    });

    // Cerrar otros filtros si están abiertos
    cerrarTodosFiltros();

    setMostrarCalendario(!mostrarCalendario);
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: Date | null): string => {
    if (!fecha) return "";
    return `${fecha.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  // Función para alternar la visualización del selector de mes de inicio
  const toggleSelectorMesInicio = () => {
    setMostrarSelectorMesInicio(!mostrarSelectorMesInicio);
    setMostrarSelectorMesFin(false);
    setSelectorAñoInicio(mesInicio.getFullYear());
  };

  // Función para alternar la visualización del selector de mes de fin
  const toggleSelectorMesFin = () => {
    setMostrarSelectorMesFin(!mostrarSelectorMesFin);
    setMostrarSelectorMesInicio(false);
    setSelectorAñoFin(mesFin.getFullYear());
  };

  // Función para cambiar el año en el selector de inicio
  const cambiarAñoInicio = (incremento: number) => {
    setSelectorAñoInicio(selectorAñoInicio + incremento);
  };

  // Función para cambiar el año en el selector de fin
  const cambiarAñoFin = (incremento: number) => {
    setSelectorAñoFin(selectorAñoFin + incremento);
  };

  // Función para seleccionar un mes en el selector de inicio
  const seleccionarMesInicio = (mes: number) => {
    setMesInicio(new Date(selectorAñoInicio, mes, 1));
    setMostrarSelectorMesInicio(false);
  };

  // Función para seleccionar un mes en el selector de fin
  const seleccionarMesFin = (mes: number) => {
    setMesFin(new Date(selectorAñoFin, mes, 1));
    setMostrarSelectorMesFin(false);
  };
  // Funciones para navegar por los meses - Calendario de inicio
  const mesAnteriorInicio = () => {
    setMesInicio(new Date(mesInicio.getFullYear(), mesInicio.getMonth() - 1, 1));
  };

  const mesSiguienteInicio = () => {
    setMesInicio(new Date(mesInicio.getFullYear(), mesInicio.getMonth() + 1, 1));
  };

  // Funciones para navegar por los meses - Calendario de fin
  const mesAnteriorFin = () => {
    setMesFin(new Date(mesFin.getFullYear(), mesFin.getMonth() - 1, 1));
  };

  const mesSiguienteFin = () => {
    setMesFin(new Date(mesFin.getFullYear(), mesFin.getMonth() + 1, 1));
  };

  // Función para seleccionar una fecha
  const esFechaEnRango = (fecha: Date): boolean => {
    if (!fechaInicio || !fechaFin) return false;

    // Creamos copias sin la hora para comparación correcta
    const inicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
    const fin = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
    const comparar = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    return comparar >= inicio && comparar <= fin;
  };

  const esFechaInicio = (fecha: Date): boolean => {
    if (!fechaInicio) return false;
    return fecha.getDate() === fechaInicio.getDate() &&
      fecha.getMonth() === fechaInicio.getMonth() &&
      fecha.getFullYear() === fechaInicio.getFullYear();
  };

  const esFechaFin = (fecha: Date): boolean => {
    if (!fechaFin) return false;
    return fecha.getDate() === fechaFin.getDate() &&
      fecha.getMonth() === fechaFin.getMonth() &&
      fecha.getFullYear() === fechaFin.getFullYear();
  };

  const seleccionarFecha = (dia: number, esMesInicio: boolean) => {
    setIsFiltering(true);
    const mes = esMesInicio ? mesInicio : mesFin;
    const fechaSeleccionada = new Date(mes.getFullYear(), mes.getMonth(), dia);

    // Modo seleccionando fecha de inicio
    if (seleccionandoInicio) {
      setFechaInicio(fechaSeleccionada);

      // Si ya hay una fecha de fin y es menor que la nueva fecha inicio, la eliminamos
      if (fechaFin && fechaSeleccionada > fechaFin) {
        setFechaFin(null);
      }

      setSeleccionandoInicio(false);
    }
    // Modo seleccionando fecha de fin
    else {
      // Si la fecha seleccionada es anterior a la fecha de inicio, las intercambiamos
      if (fechaInicio && fechaSeleccionada < fechaInicio) {
        setFechaFin(fechaInicio);
        setFechaInicio(fechaSeleccionada);
      } else {
        setFechaFin(fechaSeleccionada);
      }

      setSeleccionandoInicio(true);
    }
  };

  // Función para aplicar el rango de fechas seleccionado
  const aplicarFechas = () => {
    setMostrarCalendario(false);
    // No necesitamos lógica adicional, ya que los filtros utilizan directamente fechaInicio y fechaFin
  };

  const obtenerDiasVaciosInicio = (mes: Date): JSX.Element[] => {
    const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1).getDay();
    return Array.from({ length: primerDia }).map((_, i) => (
      <div key={`empty-start-${i}`} className="text-center p-1"></div>
    ));
  };

  // Función para renderizar la cuadrícula de días de un mes
  const renderizarDiasMes = (mes: Date, esCalendarioInicio: boolean): JSX.Element[] => {
    const diasVacios = obtenerDiasVaciosInicio(mes);
    const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const diasDelMes = Array.from({ length: diasEnMes }).map((_, i) =>
      renderizarDia(i + 1, esCalendarioInicio)
    );

    return [...diasVacios, ...diasDelMes];
  };

  // Función para cancelar la selección
  const cancelarSeleccion = () => {
    setMostrarCalendario(false);
  };

  const renderizarDia = (dia: number, esCalendarioInicio: boolean) => {
    const mes = esCalendarioInicio ? mesInicio : mesFin;
    const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia);

    // Determinar clases para el botón
    let claseBoton = "text-center p-1 rounded hover:bg-gray-100 text-sm ";

    // Si es la fecha de inicio, aplicar estilo especial
    if (esFechaInicio(fecha)) {
      claseBoton += "bg-blue-500 text-white hover:bg-blue-600 ";
    }
    // Si es la fecha de fin, aplicar estilo especial
    else if (esFechaFin(fecha)) {
      claseBoton += "bg-blue-500 text-white hover:bg-blue-600 ";
    }
    // Si está en el rango, aplicar estilo de rango
    else if (esFechaEnRango(fecha)) {
      claseBoton += "bg-blue-100 ";
    }


    return (
      <button
        key={`day-${dia}-${esCalendarioInicio ? 'inicio' : 'fin'}`}
        className={claseBoton}
        onClick={() => seleccionarFecha(dia, esCalendarioInicio)}
      >
        {dia}
      </button>
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando datos...</h2>
          <p className="text-gray-500">Por favor espere mientras se cargan los datos del sistema.</p>
        </div>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg p-6 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error al cargar datos</h2>
          <p className="text-gray-500 mb-4">{errorCarga}</p>
          <p className="text-sm text-gray-500 mb-4">Asegúrate de que el archivo urcsv.csv está en la carpeta correcta y tiene el formato adecuado.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal overlay para cerrar el menú cuando se hace clic fuera de él */}
      <FilterLoader visible={isFiltering} />
      {(mostrarFiltroAgencia || mostrarFiltroModelo || mostrarFiltroAño || mostrarFiltroPaquete || mostrarFiltroAPS || mostrarCalendario) && (
        <div
          className="fixed inset-0 z-40"
          onClick={cerrarTodosFiltros}
        ></div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/img/logo.png" alt="Nissan Logo" className="h-10" />
            <div className="text-gray-600">
              <h2 className="font-medium">Business Intelligence</h2>
              <h3 className="text-sm">3.2 Extractor de BD.</h3>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${searchTerm ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                Serie
                {searchTerm && (
                  <span className="ml-1 bg-red-100 text-red-800 text-xs px-1 rounded">
                    Filtrado
                  </span>
                )}
              </span>
              <FiltroPorSerieAvanzado
                value={searchTerm}
                onChange={debouncedSetSearchTerm}
                onSearch={handleSearch}
                placeholder="Buscar por serie"
                className="w-60"
                historialBusquedas={historialBusquedas}
                onAddToHistory={addToSearchHistory}
              />
            </div>
            <DiasSinVisitaRangeSlider
              onRangeChange={handleDiasSinVisitaRangeChange}
              initialMin={minDiasSinVisita}
              initialMax={maxDiasSinVisita}
              absoluteMin={0}
              absoluteMax={4800}
            />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white px-6 py-4 space-y-4">
        <div className="grid grid-cols-8 gap-4">
          <div className="relative">
            <button
              onClick={toggleFiltroAgencia}
              className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left"
            >
              <span className={mostrarFiltroAgencia ? "font-medium" : ""}>
                Agencias{' '}
                {/* Asegúrate de que esto use el número correcto de agencias disponibles */}
                <span className="text-xs ml-1">
                  ({Object.values(agenciasSeleccionadas).filter(v => v).length} de {agenciasDisponibles.length})
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>


            {mostrarFiltroAgencia && (
              <div className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                  top: `${posicionMenu.top}px`,
                  left: `${posicionMenu.left}px`,
                  width: `${posicionMenu.width}px`,
                }}
              >
                <div className="p-2">
                  {agenciasDisponibles.map((agencia) => (
                    <div key={agencia} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`agencia-${agencia}`}
                          className="mr-2"
                          checked={agenciasSeleccionadas[agencia] === true}
                          onChange={() => handleAgenciaCheckbox(agencia)}
                        />
                        <label htmlFor={`agencia-${agencia}`} className="text-sm">
                          {agencia}
                        </label>
                      </div>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolamenteAgencia(agencia);
                        }}
                      >
                        Solamente
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleFiltroModelo}
              className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left"
            >
              <span className={mostrarFiltroModelo ? "font-medium" : ""}>
                Modelo{' '}
                {Object.values(modelosSeleccionados).filter(v => v).length > 0 && (
                  <span className="text-xs ml-1">
                    ({Object.values(modelosSeleccionados).filter(v => v).length})
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {mostrarFiltroModelo && (
              <div className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                  top: `${posicionMenu.top}px`,
                  left: `${posicionMenu.left}px`,
                  width: `${posicionMenu.width}px`,
                }}
              >
                <div className="p-2">
                  {modelosNissan.map((modelo) => (
                    <div key={modelo} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`modelo-${modelo}`}
                          className="mr-2"
                          checked={modelosSeleccionados[modelo]}
                          onChange={() => handleModeloCheckbox(modelo)}
                        />
                        <label htmlFor={`modelo-${modelo}`} className="text-sm">
                          {modelo}
                        </label>
                      </div>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolamenteModelo(modelo);
                        }}
                      >
                        Solamente
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleFiltroAño}
              className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left"
            >
              <span className={mostrarFiltroAño ? "font-medium" : ""}>
                Año modelo{' '}
                {Object.values(añosSeleccionados).filter(v => v).length > 0 && (
                  <span className="text-xs ml-1">
                    ({Object.values(añosSeleccionados).filter(v => v).length})
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {mostrarFiltroAño && (
              <div className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                  top: `${posicionMenu.top}px`,
                  left: `${posicionMenu.left}px`,
                  width: `${posicionMenu.width}px`,
                }}
              >
                <div className="p-2">
                  {añosModelo.map((año) => (
                    <div key={año} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`año-${año}`}
                          className="mr-2"
                          checked={añosSeleccionados[año]}
                          onChange={() => handleAñoCheckbox(año)}
                        />
                        <label htmlFor={`año-${año}`} className="text-sm">
                          {año}
                        </label>
                      </div>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolamenteAño(año);
                        }}
                      >
                        Solamente
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleFiltroPaquete}
              className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left"
            >
              <span className={mostrarFiltroPaquete ? "font-medium" : ""}>
                Paquete{' '}
                {Object.values(paquetesSeleccionados).filter(v => v).length > 0 && (
                  <span className="text-xs ml-1">
                    ({Object.values(paquetesSeleccionados).filter(v => v).length})
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {mostrarFiltroPaquete && (
              <div className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                  top: `${posicionMenu.top}px`,
                  left: `${posicionMenu.left}px`,
                  width: `${posicionMenu.width}px`,
                }}
              >
                <div className="p-2">
                  {paquetesDisponibles.map((paquete) => (
                    <div key={paquete} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`paquete-${paquete}`}
                          className="mr-2"
                          checked={paquetesSeleccionados[paquete]}
                          onChange={() => handlePaqueteCheckbox(paquete)}
                        />
                        <label htmlFor={`paquete-${paquete}`} className="text-sm">
                          {paquete}
                        </label>
                      </div>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolamentePaquete(paquete);
                        }}
                      >
                        Solamente
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleFiltroAPS}
              className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left"
            >
              <span className={mostrarFiltroAPS ? "font-medium" : ""}>
                APS{' '}
                {Object.values(apsSeleccionados).filter(v => v).length > 0 && (
                  <span className="text-xs ml-1">
                    ({Object.values(apsSeleccionados).filter(v => v).length})
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {mostrarFiltroAPS && (
              <div className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{
                  top: `${posicionMenu.top}px`,
                  left: `${posicionMenu.left}px`,
                  width: `${posicionMenu.width}px`,
                }}
              >
                <div className="p-2">
                  {asesorAPS.map((aps) => (
                    <div key={aps} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`aps-${aps}`}
                          className="mr-2"
                          checked={apsSeleccionados[aps]}
                          onChange={() => handleAPSCheckbox(aps)}
                        />
                        <label htmlFor={`aps-${aps}`} className="text-sm">
                          {aps}
                        </label>
                      </div>
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSolamenteAPS(aps);
                        }}
                      >
                        Solamente
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={toggleCalendario}
              className={`w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left ${(fechaInicio && fechaFin) ? 'text-red-600 font-medium' : ''
                }`}
            >
              <span className={mostrarCalendario ? "font-medium" : ""}>
                {fechaInicio && fechaFin
                  ? `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`
                  : "Período (sin filtro)"}
                {fechaInicio && fechaFin && (
                  <span className="ml-1 bg-red-100 text-red-800 text-xs px-1 rounded">
                    Filtrado
                  </span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Reemplaza todo el bloque de calendario con este código corregido */}
            {mostrarCalendario && (
              <div className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg"
                style={{
                  top: `${posicionMenu.top}px`,
                  left: `${posicionMenu.left}px`,
                  width: `${posicionMenu.width}px`,
                }}
              >
                <div className="grid grid-cols-2 gap-4 p-4">
                  {/* Primera columna - Fecha inicio */}
                  <div className="relative">
                    <div className="text-center mb-2 text-sm font-medium">Fecha de inicio</div>
                    <div className="flex justify-between items-center mb-2">
                      <button
                        onClick={mesAnteriorInicio}
                        className="p-1 hover:bg-gray-100 rounded"
                        type="button"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={toggleSelectorMesInicio}
                        className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded"
                        type="button"
                      >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mesInicio.getMonth()]} de {mesInicio.getFullYear()}
                      </button>
                      <button
                        onClick={mesSiguienteInicio}
                        className="p-1 hover:bg-gray-100 rounded"
                        type="button"
                      >
                        &gt;
                      </button>
                    </div>

                    {/* Selector de mes y año para inicio */}
                    {mostrarSelectorMesInicio && (
                      <div className="absolute z-10 bg-white border border-gray-200 rounded shadow-lg p-2 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <button
                            onClick={() => cambiarAñoInicio(-1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            type="button"
                          >
                            &lt;
                          </button>
                          <div className="text-sm font-medium">{selectorAñoInicio}</div>
                          <button
                            onClick={() => cambiarAñoInicio(1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            type="button"
                          >
                            &gt;
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((nombreMes, index) => (
                            <button
                              key={`mes-inicio-${index}`}
                              onClick={() => seleccionarMesInicio(index)}
                              className={`text-sm p-2 rounded hover:bg-gray-100 ${mesInicio.getMonth() === index && mesInicio.getFullYear() === selectorAñoInicio
                                ? 'bg-blue-100'
                                : ''
                                }`}
                              type="button"
                            >
                              {nombreMes}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1">
                      <div className="text-center text-xs text-gray-500">Dom</div>
                      <div className="text-center text-xs text-gray-500">Lun</div>
                      <div className="text-center text-xs text-gray-500">Mar</div>
                      <div className="text-center text-xs text-gray-500">Mié</div>
                      <div className="text-center text-xs text-gray-500">Jue</div>
                      <div className="text-center text-xs text-gray-500">Vie</div>
                      <div className="text-center text-xs text-gray-500">Sáb</div>

                      {renderizarDiasMes(mesInicio, true)}
                    </div>
                  </div>

                  {/* Segunda columna - Fecha fin */}
                  <div className="relative">
                    <div className="text-center mb-2 text-sm font-medium">Fecha de finalización</div>
                    <div className="flex justify-between items-center mb-2">
                      <button
                        onClick={mesAnteriorFin}
                        className="p-1 hover:bg-gray-100 rounded"
                        type="button"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={toggleSelectorMesFin}
                        className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded"
                        type="button"
                      >
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mesFin.getMonth()]} de {mesFin.getFullYear()}
                      </button>
                      <button
                        onClick={mesSiguienteFin}
                        className="p-1 hover:bg-gray-100 rounded"
                        type="button"
                      >
                        &gt;
                      </button>
                    </div>

                    {/* Selector de mes y año para fin */}
                    {mostrarSelectorMesFin && (
                      <div className="absolute z-10 bg-white border border-gray-200 rounded shadow-lg p-2 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <button
                            onClick={() => cambiarAñoFin(-1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            type="button"
                          >
                            &lt;
                          </button>
                          <div className="text-sm font-medium">{selectorAñoFin}</div>
                          <button
                            onClick={() => cambiarAñoFin(1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            type="button"
                          >
                            &gt;
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((nombreMes, index) => (
                            <button
                              key={`mes-fin-${index}`}
                              onClick={() => seleccionarMesFin(index)}
                              className={`text-sm p-2 rounded hover:bg-gray-100 ${mesFin.getMonth() === index && mesFin.getFullYear() === selectorAñoFin
                                ? 'bg-blue-100'
                                : ''
                                }`}
                              type="button"
                            >
                              {nombreMes}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1">
                      <div className="text-center text-xs text-gray-500">Dom</div>
                      <div className="text-center text-xs text-gray-500">Lun</div>
                      <div className="text-center text-xs text-gray-500">Mar</div>
                      <div className="text-center text-xs text-gray-500">Mié</div>
                      <div className="text-center text-xs text-gray-500">Jue</div>
                      <div className="text-center text-xs text-gray-500">Vie</div>
                      <div className="text-center text-xs text-gray-500">Sáb</div>

                      {renderizarDiasMes(mesFin, false)}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end p-3 border-t border-gray-200 space-x-2">
                  <button
                    onClick={cancelarSeleccion}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
                    type="button"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={aplicarFechas}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                    type="button"
                  >
                    APLICAR
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Nombre de factura"
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm"
              value={filtroNombreFactura}
              onChange={handleNombreFacturaChange}
            />
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Celular/Teléfono/Oficina"
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm"
              value={filtroCelular}
              onChange={handleCelularChange}
            />
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Período:</span>
            <div className="text-sm font-medium">
              {fechaInicio && fechaFin
                ? `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`
                : "Período automático (sin filtro de fecha)"}
            </div>
          </div>
          <div className="flex space-x-3"> {/* Añadimos un div para contener ambos botones */}
            <button
              onClick={resetearFiltros}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition duration-200"
            >
              Resetear Filtros
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition duration-200">
              Buscar
            </button>
          </div>
        </div>
      </div>
      {cargandoPagina && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-700">Cargando página {currentPage + 1}...</p>
          </div>
        </div>
      )}
      {/* Table - Con el contenedor de scroll mejorado */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow">
          {/* Aplicamos un contenedor con altura fija y scroll en ambas direcciones */}
          <div className="relative" style={{ height: "500px" }}>
            {/* Tabla con cabecera fija */}
            <div className="overflow-x-auto overflow-y-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 top-0 z-20">
                      #
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última visita
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serie
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre factura
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agencia
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Celular
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      T. oficina
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cloudtalk
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paquete
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      APS
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TOTAL
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Días sin venir
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentItems().length > 0 ? (
                    getCurrentItems().map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky left-0 bg-inherit z-10">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.ultimaVisita ? formatearFechaTabla(item.ultimaVisita) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.serie}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.modelo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.año}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.nombreFactura}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.contacto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.agencia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {!isEmpty(item.celular) ? item.celular : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {!isEmpty(item.telefono) ? item.telefono : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {!isEmpty(item.tOficina) ? item.tOficina : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {determinaCloudTalk(item)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.paquete && item.paquete !== 'null' ? item.paquete : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.orden || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.aps || 'ASESOR VIRTUAL'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.total || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.diasSinVenir}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={17} className="px-6 py-4 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {filteredData.length > 0 ? (
                  <>
                    {/* Si tenemos resultados filtrados */}
                    {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} - {' '}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}

                    {/* Indicar si hay filtros activos */}
                    {hayFiltrosActivos() && (
                      <span className="ml-1 text-blue-600">
                        {/* Si toda la base está cargada */}
                        {filteredData.length !== totalRegistros ? (
                          <>(Filtrado de {clientesData.length} de {totalRegistros} totales)</>
                        ) : (
                          <>(Filtrado de {totalRegistros} totales)</>
                        )}
                      </span>
                    )}

                    {/* Si no hay filtros activos pero no tenemos todos los datos cargados */}
                    {!hayFiltrosActivos() && clientesData.length < totalRegistros && (
                      <span className="ml-1 text-blue-600">
                        (Cargados {clientesData.length} de {totalRegistros} totales)
                      </span>
                    )}
                  </>
                ) : (
                  'No hay registros que coincidan con los filtros'
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${currentPage === 1 || cargandoPagina ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || cargandoPagina}
                >
                  Anterior
                </button>

                {/* Mostrar número de página actual */}
                <span className="px-3 py-1 bg-red-600 text-white rounded-md text-sm">
                  {currentPage}
                </span>

                <button
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${cargandoPagina ||
                    // Si hay filtros activos, deshabilitar el botón cuando estemos en la última página de datos filtrados
                    (hayFiltrosActivos() && currentPage >= Math.ceil(filteredData.length / itemsPerPage)) ||
                    // Si no hay filtros, usar la lógica original
                    (!hayFiltrosActivos() && currentPage * itemsPerPage >= totalRegistros)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    cargandoPagina ||
                    // Deshabilitar si hay filtros y estamos en la última página
                    (hayFiltrosActivos() && currentPage >= Math.ceil(filteredData.length / itemsPerPage)) ||
                    // Si no hay filtros, usar la lógica original
                    (!hayFiltrosActivos() && currentPage * itemsPerPage >= totalRegistros)
                  }
                >
                  {cargandoPagina ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando...
                    </span>
                  ) : 'Siguiente'}
                </button>

                <button
                  className="ml-2 px-3 py-1 bg-gray-600 text-white rounded-md text-sm font-medium"
                  onClick={() => {
                    if (cargandoPagina) return;
                    limpiarCacheCSV();
                    setClientesData([]);
                    setCurrentPage(1);
                    setIsLoading(true);
                    cargarDatosPaginados(1);
                  }}
                  disabled={cargandoPagina}
                >
                  Recargar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;