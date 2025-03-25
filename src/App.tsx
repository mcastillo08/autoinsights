import React from 'react';
import './index.css';
import logo from './logo.png';

const App: React.FC = () => {
  // Estado para almacenar la fecha actual
  const [currentDateTime, setCurrentDateTime] = React.useState<Date>(new Date());

  // Efecto para actualizar la fecha cada minuto
  React.useEffect(() => {
    setCurrentDateTime(new Date());
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Formato para mostrar la fecha
  currentDateTime.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const clientes = [
    {
      id: "2501",
      ultimaVisita: "27 feb 2025",
      serie: "3N6AD33C3GK814458",
      modelo: "FRONTIER",
      año: "2016",
      nombreFactura: "ZAPATA MORA LUCIA MARIA",
      contacto: "DANIEL CASTELLANOS CASTELLANOS",
      agencia: "NOGALES",
      celular: "5262247002276",
      telefono: "5263131800",
      tOficina: "6313145339",
      cloudtalk: "+5262247002276",
      paquete: "-",
      orden: "73426",
      aps: "MARITZA MARTINEZ FRASQUILLO",
      total: "3.02",
      diasSinVenir: "25"
    },
    {
      id: "2502",
      ultimaVisita: "27 feb 2025",
      serie: "3N1CK3CE9ML222340",
      modelo: "MARCH",
      año: "2021",
      nombreFactura: "ROBLES ROCHA JOSE ALBERTO",
      contacto: "OSCAR ONTIVEROS OSCAR ONTIVEROS",
      agencia: "NISSAUTO",
      celular: "5262218024448",
      telefono: "-",
      tOficina: "5262226097714",
      cloudtalk: "+5262218024448",
      paquete: "BR1",
      orden: "402350",
      aps: "YEZENIA RIVAS AMAYA",
      total: "4979.32",
      diasSinVenir: "25"
    },
    {
      id: "2503",
      ultimaVisita: "27 feb 2025",
      serie: "3N1AB7AEXFL611802",
      modelo: "SENTRA",
      año: "2015",
      nombreFactura: "DEVORA HERRERA SAMUEL ALBERTO",
      contacto: "SAMUEL ALBERTO DEVORA HERRERA",
      agencia: "GUAYMAS",
      celular: "5262213848471",
      telefono: "5262271068925",
      tOficina: "-",
      cloudtalk: "+5262213848471",
      paquete: "-",
      orden: "95943",
      aps: "FRANCISCO DE JESUS NAVARRO GAMEZ",
      total: "9741.16",
      diasSinVenir: "25"
    },
    {
      id: "2504",
      ultimaVisita: "27 feb 2025",
      serie: "3N8CP5HD2JL487918",
      modelo: "KICKS",
      año: "2018",
      nombreFactura: "ROMERO ROBLES JOSE ANGEL",
      contacto: "JOSE ANGEL ROMERO ROBLES",
      agencia: "NISSAUTO",
      celular: "5262217240988",
      telefono: "-",
      tOficina: "-",
      cloudtalk: "+5262217240988",
      paquete: "-",
      orden: "402290",
      aps: "APS VIRTUAL",
      total: "178.28",
      diasSinVenir: "25"
    },
    {
      id: "2505",
      ultimaVisita: "27 feb 2025",
      serie: "3N1AB7ADXGL643967",
      modelo: "SENTRA",
      año: "2016",
      nombreFactura: "NR FINANCE MEXICO",
      contacto: "IAN BONSON SAMANIEGO",
      agencia: "GRANAUTO",
      celular: "5262217267456",
      telefono: "-",
      tOficina: "-",
      cloudtalk: "+5262217267456",
      paquete: "-",
      orden: "302348",
      aps: "ALEJANDRA ABIGAIL MORENO",
      total: "21.26",
      diasSinVenir: "25"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con logo */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Grupo Auto Logo"
            className="h-10 mr-3"
          />
          <div>
            <h1 className="text-lg font-semibold">Business Intelligence</h1>
            <p className="text-sm text-gray-600">3.2 Extractor de BD.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2">Serie</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Introduzca un valor"
                className="px-3 py-2 border rounded-md w-64"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <span className="mr-2">Días sin venir a taller</span>
            <div className="flex items-center">
              <input type="text" className="px-2 py-1 border rounded-md w-16" defaultValue="1" />
              <span className="mx-1">a</span>
              <input type="text" className="px-2 py-1 border rounded-md w-16" defaultValue="4756" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Barra de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Agencia</option>
              <option value="NISSAUTO">NISSAUTO</option>
              <option value="GUAYMAS">GUAYMAS</option>
              <option value="NOGALES">NOGALES</option>
              <option value="GRANAUTO">GRANAUTO</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Modelo</option>
              <option value="FRONTIER">FRONTIER</option>
              <option value="MARCH">MARCH</option>
              <option value="SENTRA">SENTRA</option>
              <option value="KICKS">KICKS</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Año modelo</option>
              <option value="2015">2015</option>
              <option value="2016">2016</option>
              <option value="2018">2018</option>
              <option value="2021">2021</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Paquete</option>
              <option value="BR1">BR1</option>
              <option value="SEM">SEM</option>
              <option value="PC1">PC1</option>
              <option value="PC2">PC2</option>
              <option value="PRO">PRO</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">APS</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Selecciona un período</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Nombre de factura</option>
            </select>
          </div>

          <div className="relative">
            <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Celular</option>
            </select>
          </div>
        </div>

        {/* Tabla con desplazamiento horizontal - combinando ambas estructuras */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">-</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ultima visita</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Serie</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Modelo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Año</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Nombre factura</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Contacto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Agencia</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Celular</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">T. oficina</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cloudtalk</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Paquete</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Orden</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">APS</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">TOTAL</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Días sin venir a taller</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.ultimaVisita}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.serie}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.modelo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.año}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.nombreFactura}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.contacto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.agencia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.celular}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.tOficina}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.cloudtalk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.paquete}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.orden}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.aps}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.diasSinVenir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              2501 - 5000 / 62368
            </div>
            <div className="flex space-x-2">
              <button type="button" className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button type="button" className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Pie de página con fecha de actualización */}
        {/* Pie de página con fecha de actualización dinámica */}
        <div className="mt-4 text-xs text-gray-500">
          Fecha de la última actualización: {currentDateTime.toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })} | <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
        </div>
      </main>
    </div>
  );
};

export default App;