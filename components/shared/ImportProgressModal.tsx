import React, { useEffect, useState } from 'react';
import Modal from '../shared/Modal';

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ImportProgressModalProps {
    isOpen: boolean;
    title: string;
    totalItems: number;
    processedItems: number;
    currentItem?: string;
    isComplete: boolean;
    successMessage?: string;
    errorMessage?: string;
    onClose: () => void;
    successCount?: number;
    errorCount?: number;
    detailItems?: { rowNumber?: number; error: string }[];
}

const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
    isOpen,
    title,
    totalItems,
    processedItems,
    currentItem,
    isComplete,
    successMessage,
    errorMessage,
    onClose,
    successCount,
    errorCount,
    detailItems
}) => {
    const progressPercentage = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (!isOpen || !isComplete) {
            setShowDetails(false);
        }
    }, [isOpen, isComplete]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={isComplete ? onClose : undefined}
            title={title}
            maxWidthClass="max-w-md"
            footer={
                isComplete ? (
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : null
            }
        >
            <div className="p-6">
                {!isComplete ? (
                    <div className="space-y-4">
                        <div className="text-center">
                            <GoogleIcon name="upload" className="text-4xl text-blue-500 mb-2" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Importando datos...
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Progreso de importación</span>
                                <span>{processedItems} de {totalItems} registros</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-[#aa632d] h-3 rounded-full transition-all duration-500 ease-out relative"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="text-lg font-semibold text-[#aa632d]">{progressPercentage}%</span>
                                <span className="text-sm text-gray-500 ml-1">completado</span>
                            </div>
                        </div>

                        {currentItem && (
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <GoogleIcon name="sync" className="inline mr-1 animate-spin" />
                                    Procesando: <span className="font-semibold">{currentItem}</span>
                                </p>
                            </div>
                        )}

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Por favor espera mientras se procesan los datos...
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                No cierres esta ventana hasta que se complete la importación
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center">
                            {errorMessage ? (
                                <>
                                    <GoogleIcon name="error" className="text-4xl text-red-500 mb-2" />
                                    <h3 className="text-lg font-semibold text-red-800">
                                        Error en la importación
                                    </h3>
                                </>
                            ) : (
                                <>
                                    <GoogleIcon name="check_circle" className="text-4xl text-green-500 mb-2" />
                                    <h3 className="text-lg font-semibold text-green-800">
                                        Importación completada
                                    </h3>
                                </>
                            )}
                        </div>

                        <div className="text-center">
                            {errorMessage ? (
                                <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{errorMessage}</p>
                            ) : (
                                <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg font-medium">{successMessage}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumen de la importación</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Total de registros en archivo:</span>
                                    <span className="font-medium">{totalItems}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Registros procesados:</span>
                                    <span className={`font-medium ${errorMessage ? 'text-red-600' : 'text-green-600'}`}>
                                        {processedItems}
                                    </span>
                                </div>
                                {typeof successCount === 'number' && (
                                    <div className="flex justify-between">
                                        <span>Registros exitosos:</span>
                                        <span className="font-medium text-green-600">{successCount}</span>
                                    </div>
                                )}
                                {typeof errorCount === 'number' && (
                                    <div className="flex justify-between">
                                        <span>Registros con error:</span>
                                        <span className={`font-medium ${errorCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                            {errorCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {detailItems && detailItems.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-red-700">Detalle de errores detectados</p>
                                    <button
                                        type="button"
                                        onClick={() => setShowDetails(prev => !prev)}
                                        className="text-xs font-medium text-red-700 hover:text-red-900"
                                    >
                                        {showDetails ? 'Ocultar' : 'Ver'}
                                    </button>
                                </div>
                                {showDetails && (
                                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 text-sm text-red-700">
                                        {detailItems.map((detail, idx) => (
                                            <li key={`${detail.rowNumber ?? idx}-${idx}`} className="bg-white border border-red-100 rounded-md p-2">
                                                {detail.rowNumber ? `Fila ${detail.rowNumber}` : `Registro ${idx + 1}`}:
                                                <span className="ml-1">{detail.error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {!showDetails && (
                                    <p className="text-xs text-red-600">Haz clic en "Ver" para revisar cada error.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportProgressModal;