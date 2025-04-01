import React, { useState } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
// Importar el icono correcto


interface ExportCSVButtonProps {
    tableData: Array<any>;
    maxRows?: number;
    filename?: string;
    disabled?: boolean;
}

const ExportCSVButton: React.FC<ExportCSVButtonProps> = ({
    tableData,
    maxRows = 700,
    filename = 'Business Intelligence',
    disabled = false
}) => {
    const [isExporting, setIsExporting] = useState<boolean>(false);

    // Función para normalizar números de teléfono (eliminar +52)
    const normalizePhone = (phone: string): string => {
        if (!phone || typeof phone !== 'string' || phone === '-') return '';

        // Eliminar cualquier prefijo +52 o 52 al inicio
        let cleanPhone = phone.replace(/^\+?52/, '');

        // Eliminar cualquier caracter que no sea un dígito
        cleanPhone = cleanPhone.replace(/\D/g, '');

        return cleanPhone;
    };

    // Función para seleccionar el primer número de teléfono disponible
    const getFirstAvailablePhone = (row: any): string => {
        // Intentar obtener de Celular, Teléfono o T. oficina en ese orden
        if (row.celular && row.celular !== '-') {
            return normalizePhone(row.celular);
        }
        if (row.telefono && row.telefono !== '-') {
            return normalizePhone(row.telefono);
        }
        if (row.tOficina && row.tOficina !== '-') {
            return normalizePhone(row.tOficina);
        }
        if (row.cloudtalk && row.cloudtalk !== '-') {
            return normalizePhone(row.cloudtalk);
        }
        return '';
    };


    // Preparar los datos para exportación según el formato requerido
    const prepareDataForExport = (data: Array<any>): Array<any> => {
        // Limitar a máximo la cantidad de filas especificada
        const limitedData = data.slice(0, maxRows);

        return limitedData.map(row => {
            // Crear un nuevo objeto con los campos en el formato solicitado
            return {
                name: row.nombreFactura || '', // Cambiado de row.contacto a row.nombreFactura
                phone: getFirstAvailablePhone(row), // Ahora devolverá solo el número limpio
                email: '',
                email2: '',
                title: '',
                company: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                industry: '',
                website: '',
                AGENCIA: row.agencia || '',
                VIN: row.serie || '',
                MODELO: row.modelo || '',
                'AÃƒâ€˜O DEL VIN': row.año ? row.año.toString() : '',
                'COLOR DEL VEHICULO': '',
                'ULTIMA VISITA': '',
                PERIODO: '',
                ASESOR: ''
                // No incluimos CADENA como se solicitó
            };
        });
    };

    // Función para manejar la exportación
    const handleExport = async () => {
        try {
            setIsExporting(true);

            // Preparar los datos para la exportación
            const dataToExport = prepareDataForExport(tableData);

            // Convertir a CSV usando PapaParse
            const csv = Papa.unparse(dataToExport, {
                header: true,
                delimiter: ',',
                newline: '\r\n', // Formato CRLF estándar para Excel
                quotes: true     // Forzar comillas en todos los campos
            });

            // Crear un blob y descargar el archivo
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8-sig' }); // Añadir BOM para Excel
            saveAs(blob, `${filename}.csv`);

        } catch (error) {
            console.error('Error al exportar datos:', error);
        } finally {
            setIsExporting(false);
        }
    };
    // Versión simple del botón sin muchas animaciones
    return (
        <button
            onClick={handleExport}
            disabled={disabled || isExporting || tableData.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition duration-200"
        >
            {isExporting ? 'Exportando...' : 'Exportar'}
        </button>
    );
};

export default ExportCSVButton;