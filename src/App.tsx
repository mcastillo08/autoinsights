import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Calendar } from 'lucide-react';
import DiasSinVisitaRangeSlider from './DiasSinVisitaRangeSlider';
import { cargarDatosCSV } from './CsvDataService';

// Definimos las interfaces para TypeScript
interface Cliente {
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

// Definimos el tipo para las agencias
type AgenciasType = {
  [key: string]: boolean;
};

// Definimos el tipo para los paquetes
type PaquetesType = {
  [key: string]: boolean;
};

// Definimos el tipo para los asesores APS
type APSType = {
  [key: string]: boolean;
};

// Función para verificar si un campo está vacío o solo contiene espacios
const isEmpty = (value?: string): boolean => {
  return !value || value.trim() === '';
};



const formatearFechaTabla = (fecha: Date): string => {
  if (!fecha) return "-";
  const dia = fecha.getDate();
  const mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][fecha.getMonth()];
  const año = fecha.getFullYear();
  return `${dia} ${mes} ${año}`;
};

function App() {
  // Estados para la carga de datos
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mostrarFiltroAgencia, setMostrarFiltroAgencia] = useState<boolean>(false);
  const [mostrarFiltroModelo, setMostrarFiltroModelo] = useState<boolean>(false);
  const [mostrarFiltroAño, setMostrarFiltroAño] = useState<boolean>(false);
  const [posicionMenu, setPosicionMenu] = useState({ top: 0, left: 0, width: 0 });
  const [mostrarFiltroPaquete, setMostrarFiltroPaquete] = useState<boolean>(false);
  const [mostrarFiltroAPS, setMostrarFiltroAPS] = useState<boolean>(false);
  const [modelosDisponibles, setModelosDisponibles] = useState<string[]>([]);
  const [añosDisponibles, setAñosDisponibles] = useState<string[]>([]);
  const [asesoresDisponibles, setAsesoresDisponibles] = useState<string[]>([]);

  // @ts-ignore
  const [minDiasSinVisita, setMinDiasSinVisita] = useState<number>(0);
  // @ts-ignore
  const [maxDiasSinVisita, setMaxDiasSinVisita] = useState<number>(250);

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


  // Esto debería estar después de la definición de tus estados
  // Cerca de la línea 150-180 en tu archivo App.tsx
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando carga de datos CSV...");
        const { clientes } = await cargarDatosCSV();
        console.log("Datos cargados:", clientes.length, "registros");
        setClientesData(clientes);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorCarga(null);

      try {
        console.log("Iniciando carga de datos CSV...");
        const { clientes, modelos, años, asesores } = await cargarDatosCSV();

        console.log("Datos cargados:", clientes.length, "registros");
        setClientesData(clientes);

        console.log("Muestra de primeros 5 registros:");
        clientes.slice(0, 5).forEach((cliente, idx) => {
          console.log(`Cliente ${idx + 1}:`, {
            id: cliente.id,
            agencia: cliente.agencia,
            modelo: cliente.modelo,
            año: cliente.año,
            paquete: cliente.paquete,
            aps: cliente.aps,
            diasSinVenir: cliente.diasSinVenir
          });
        });

        // Actualizar las listas disponibles con los datos del CSV
        setModelosDisponibles(modelos);
        setAñosDisponibles(años);
        setAsesoresDisponibles(asesores);

        // Actualizar las agencias disponibles con normalización
        const agencias = Array.from(new Set(clientes.map(cliente =>
          cliente.agencia ? cliente.agencia.trim() : ''
        )))
          .filter(agencia => agencia)
          .sort();

        setAgenciasDisponibles(agencias);

        // Inicializar las agencias seleccionadas con los valores reales
        setAgenciasSeleccionadas(_ => {
          const nuevo: AgenciasType = {};
          agencias.forEach(agencia => {
            nuevo[agencia] = true;
          });
          return nuevo;
        });

        // Actualizar los paquetes disponibles
        const paquetes = Array.from(new Set(clientes.map(cliente => cliente.paquete || 'null')))
          .filter(paquete => paquete)
          .sort();
        setPaquetesDisponibles(paquetes);

        // Inicializar los estados de selección para incluir todos los elementos
        setModelosSeleccionados(_ => {
          const nuevo: { [key: string]: boolean } = {};
          modelos.forEach(modelo => {
            nuevo[modelo] = true;
          });
          return nuevo;
        });

        setAñosSeleccionados(_ => {
          const nuevo: { [key: string]: boolean } = {};
          años.forEach(año => {
            nuevo[año] = true;
          });
          return nuevo;
        });

        setAPSSeleccionados(_ => {
          const nuevo: { [key: string]: boolean } = {};
          asesores.forEach(asesor => {
            nuevo[asesor] = true;
          });
          return nuevo;
        });

      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setErrorCarga(error instanceof Error ? error.message : 'Error desconocido al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  // Inicializar el estado de los asesores APS seleccionados
  const [apsSeleccionados, setAPSSeleccionados] = useState<APSType>({});

  // @ts-ignore
  const [agenciasDisponibles, setAgenciasDisponibles] = useState<string[]>([
    'AGUA PRIETA', 'CABORCA', 'GRANAUTO', 'GUAYMAS', 'MAGDALENA', 'NISSAUTO', 'NOGALES', 'MORELOS'
  ]);

  const [agenciasSeleccionadas, setAgenciasSeleccionadas] = useState<AgenciasType>(() => {
    const inicial: AgenciasType = {};
    agenciasDisponibles.forEach(agencia => {
      inicial[agencia] = true;
    });
    return inicial;
  });

  // Lista de paquetes disponibles actualizada - Incluye todos los paquetes de los datos
  // Estado para los paquetes disponibles
  const [paquetesDisponibles, setPaquetesDisponibles] = useState<string[]>([
  ]);

  useEffect(() => {
    if (clientesData.length > 0) {
      const paquetes = Array.from(new Set(clientesData.map(cliente => cliente.paquete || 'null')))
        .filter(paquete => paquete) // Filtrar valores vacíos
        .sort();

      setPaquetesDisponibles(paquetes);

      // Actualizar el estado de selección para incluir todos los paquetes
      setPaquetesSeleccionados(prev => {
        const nuevo: PaquetesType = { ...prev };
        paquetes.forEach(paquete => {
          if (!(paquete in nuevo)) {
            nuevo[paquete] = true;
          }
        });
        return nuevo;
      });
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
  const [modelosSeleccionados, setModelosSeleccionados] = useState<{ [key: string]: boolean }>({});


  // Estado para los años seleccionados
  const [añosSeleccionados, setAñosSeleccionados] = useState<{ [key: string]: boolean }>({});


  // Función para manejar los cambios en los checkboxes de paquete
  const handlePaqueteCheckbox = (paquete: string) => {
    setPaquetesSeleccionados(prev => ({
      ...prev,
      [paquete]: !prev[paquete]
    }));
  };

  // Función para formatear números telefónicos
  const formatearTelefono = (numero?: string | number): string => {
    if (!numero) return '-';

    // Convertir a string y quitar formato científico
    let numeroStr = String(numero);

    // Si es notación científica, convertirla
    if (numeroStr.includes('E+') || numeroStr.includes('e+')) {
      numeroStr = Number(numeroStr).toLocaleString('fullwide', { useGrouping: false });
    }

    // Si el número es muy largo (como 10 dígitos o más), darle formato
    if (numeroStr.length >= 10) {
      // Ejemplo: 5261234567 -> 526-123-4567
      return numeroStr.replace(/(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
    }

    return numeroStr;
  };

  const determinaCloudTalk = (cliente: Cliente): string => {
    // Verificar celular primero
    if (!isEmpty(cliente.celular)) {
      const numero = formatearTelefono(cliente.celular);
      return numero !== '-' ? `+${numero}` : '-';
    }

    // Si no hay celular, verificar teléfono
    if (!isEmpty(cliente.telefono)) {
      const numero = formatearTelefono(cliente.telefono);
      return numero !== '-' ? `+${numero}` : '-';
    }

    // Si no hay teléfono, verificar T. oficina
    if (!isEmpty(cliente.tOficina)) {
      const numero = formatearTelefono(cliente.tOficina);
      return numero !== '-' ? `+${numero}` : '-';
    }

    // Si no hay ninguno, mostrar guión
    return '-';
  };

  // Función para manejar los cambios en los checkboxes de APS
  const handleAPSCheckbox = (aps: string) => {
    setAPSSeleccionados(prev => ({
      ...prev,
      [aps]: !prev[aps]
    }));
  };

  // Función para seleccionar solamente un APS
  const handleSolamenteAPS = (aps: string) => {
    const nuevosAPS: APSType = {};
    Object.keys(apsSeleccionados).forEach(key => {
      nuevosAPS[key] = key === aps;
    });
    setAPSSeleccionados(nuevosAPS);
  };

  // Función para seleccionar solamente un paquete
  const handleSolamentePaquete = (paquete: string) => {
    const nuevosPaquetes: PaquetesType = {};
    Object.keys(paquetesSeleccionados).forEach(key => {
      nuevosPaquetes[key] = key === paquete;
    });
    setPaquetesSeleccionados(nuevosPaquetes);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Función para manejar los cambios en los checkboxes de agencia
  const handleAgenciaCheckbox = (agencia: string) => {
    setAgenciasSeleccionadas(prev => ({
      ...prev,
      [agencia]: !prev[agencia]
    }));
  };

  // Función para manejar los cambios en los checkboxes de modelo
  const handleModeloCheckbox = (modelo: string) => {
    setModelosSeleccionados(prev => ({
      ...prev,
      [modelo]: !prev[modelo]
    }));
  };

  // Función para manejar los checkboxes de año modelo
  const handleAñoCheckbox = (año: string) => {
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

  // Función para manejar cambios en el input del celular
  const handleDiasSinVisitaRangeChange = (min: number, max: number) => {
    // Caso especial: si ambos valores son 0, mostrar todos los registros
    if (min === 0 && max === 0) {
      setMinDiasSinVisita(0);
      setMaxDiasSinVisita(250); // Valor máximo que permita incluir todos tus datos
    } else {
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

  // Función para filtrar los clientes Agencia
  const filtrarClientes = () => {
    console.log("Filtrando clientes...");
    console.log("Total de clientes:", clientesData.length);
    console.log("Agencias seleccionadas:", agenciasSeleccionadas);
    console.log("Modelos seleccionados:", modelosSeleccionados);
    console.log("Años seleccionados:", añosSeleccionados);

    const filtrados = clientesData.filter(cliente => {
      // Filtro por agencia
      const agenciaCliente = cliente.agencia ? cliente.agencia.trim() : '';
      if (agenciaCliente === '') {
        return false;
      }

      let agenciaEncontrada = false;
      for (const [agenciaKey, seleccionada] of Object.entries(agenciasSeleccionadas)) {
        if (seleccionada && agenciaCliente.toUpperCase() === agenciaKey.toUpperCase()) {
          agenciaEncontrada = true;
          break;
        }
      }

      if (!agenciaEncontrada) {
        return false;
      }

      // Filtro por modelo
      const modeloCliente = cliente.modelo ? cliente.modelo.trim() : '';
      if (modeloCliente === '') {
        return false;
      }

      let modeloEncontrado = false;
      for (const [modeloKey, seleccionado] of Object.entries(modelosSeleccionados)) {
        if (seleccionado && modeloCliente.toUpperCase() === modeloKey.toUpperCase()) {
          modeloEncontrado = true;
          break;
        }
      }

      if (!modeloEncontrado) {
        return false;
      }

      // Filtro por año modelo
      const añoCliente = cliente.año ? cliente.año.toString() : '';
      if (añoCliente === '') {
        return false;
      }

      let añoEncontrado = false;
      for (const [añoKey, seleccionado] of Object.entries(añosSeleccionados)) {
        if (seleccionado && añoCliente === añoKey) {
          añoEncontrado = true;
          break;
        }
      }

      if (!añoEncontrado) {
        return false;
      }

      // Si pasa todos los filtros, incluir el cliente
      return true;
    });

    console.log("Clientes filtrados:", filtrados.length);
    return filtrados;
  };
  // Variable para almacenar los clientes filtrados
  const clientesFiltrados = filtrarClientes();

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
              <span className="text-sm text-gray-600">Serie</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Introduce un valor"
                  className="border border-gray-300 rounded-md pl-8 pr-3 py-1 text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <DiasSinVisitaRangeSlider
              onRangeChange={handleDiasSinVisitaRangeChange}
              initialMin={1}
              initialMax={250}
              absoluteMin={0}
              absoluteMax={250}
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
                Agencia{' '}
                {Object.values(agenciasSeleccionadas).filter(v => v).length > 0 && (
                  <span className="text-xs ml-1">
                    ({Object.values(agenciasSeleccionadas).filter(v => v).length})
                  </span>
                )}
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
                  {Object.keys(agenciasSeleccionadas).map((agencia) => (
                    <div key={agencia} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`agencia-${agencia}`}
                          className="mr-2"
                          checked={agenciasSeleccionadas[agencia]}
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
                  {modelosDisponibles.map((modelo) => (
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
                  {añosDisponibles.map((año) => (
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
                  {asesoresDisponibles.map((aps) => (
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
              className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-left"
            >
              <span className={mostrarCalendario ? "font-medium" : ""}>
                {fechaInicio && fechaFin
                  ? `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`
                  : "Período automático"}
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
              placeholder="Celular"
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
            <div className="text-sm font-medium">14 Mar 2023 - 14 Mar 2024</div>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium">
            Buscar
          </button>
        </div>
      </div>

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
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.slice(0, 200).map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky left-0 bg-inherit z-10">
                          {item.id}
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
                          {formatearTelefono(item.celular)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatearTelefono(item.telefono)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatearTelefono(item.tOficina)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {determinaCloudTalk(item)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.paquete && item.paquete !== 'null' ?
                            (isNaN(Number(item.paquete)) ? item.paquete : item.paquete.padStart(3, '0'))
                            : '-'}
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
                1 - {Math.min(clientesFiltrados.length, 200)} / {clientesData.length}
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  Anterior
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  Siguiente
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