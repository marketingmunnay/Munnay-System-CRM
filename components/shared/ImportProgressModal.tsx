import React from 'react';
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
    onClose
}) => {
    const progressPercentage = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;

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
                                {errorMessage && (
                                    <div className="flex justify-between">
                                        <span>Registros con error:</span>
                                        <span className="font-medium text-red-600">
                                            {totalItems - processedItems}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportProgressModal;