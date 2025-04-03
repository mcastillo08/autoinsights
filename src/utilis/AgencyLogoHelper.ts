// Define el tipo AgenciaNombre directamente aquí para evitar problemas de importación
export type AgenciaNombre = 'Gran Auto' | 'Gasme' | 'Sierra' | 'Huerpel' | 'Del Bravo';

// Mapeo de agencias a nombres de archivo de logo
const agencyLogoMap: Record<AgenciaNombre, string> = {
  'Gran Auto': 'granauto.png',
  'Gasme': 'gasme.png',
  'Sierra': 'sierra.png',
  'Huerpel': 'huerpel.png',
  'Del Bravo': 'delbravo.png'
};
  
// Función para obtener la URL de la imagen del logo de la agencia
export const getAgencyLogoUrl = (agencia: AgenciaNombre): string => {
  const logoFilename = agencyLogoMap[agencia] || 'icon.png';
  return `/img/${logoFilename}`;
};