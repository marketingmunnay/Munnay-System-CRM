import React, { useState, useEffect } from 'react';
import type { Incidencia, Lead } from '../../types.ts';
import { INCIDENCIA_TYPES } from '../../constants.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon } from '../shared/Icons.tsx';
import { formatTimeForInput, formatDateForInput } from '../../utils/time';

interface IncidenciaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incidencia: Incidencia) => void;
  onDelete: (incidenciaId: number) => void;
  incidencia: Incidencia | null;
  pacientes: Lead[];
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const TIPO_INCIDENCIA_OPTIONS = Object.keys(INCIDENCIA_TYPES);

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const IncidenciaFormModal: React.FC<IncidenciaFormModalProps> = ({ isOpen, onClose, onSave, onDelete, incidencia, pacientes, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<Incidencia>>({});
  const [historiaSearch, setHistoriaSearch] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Lead | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (incidencia) {
            const paciente = pacientes.find(p => p.id === incidencia.pacienteId);
            setFormData(incidencia);
            setHistoriaSearch(incidencia.nHistoria);
            setPacienteEncontrado(paciente || null);
        } else {
            const now = new Date();
            setFormData({
                id: Date.now(),
                fecha: now.toISOString().split('T')[0],
                hora: now.toTimeString().slice(0, 5),
                solucionado: false,
            });
            setHistoriaSearch('');
            setPacienteEncontrado(null);
        }
    }
  }, [incidencia, pacientes, isOpen]);
  
  const handleHistoriaSearch = () => {
    if (!historiaSearch.trim()) {
        alert("Por favor, ingrese un N° de historia.");
        return;
    }
    const paciente = pacientes.find(p => p.nHistoria?.toLowerCase() === historiaSearch.toLowerCase());
    if (paciente) {
        setPacienteEncontrado(paciente);
        setFormData(prev => ({
            ...prev,
            pacienteId: paciente.id,
            nHistoria: paciente.nHistoria,
            nombrePaciente: `${paciente.nombres} ${paciente.apellidos}`
        }));
    } else {
        alert("Paciente no encontrado. Verifique el N° de historia.");
        setPacienteEncontrado(null);
    }
  };

  const handleResetSearch = () => {
      setPacienteEncontrado(null);
      setHistoriaSearch('');
      setFormData(prev => ({
          ...prev,
          pacienteId: undefined,
          nHistoria: undefined,
          nombrePaciente: undefined,
      }));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newFormData = { ...formData };

    if (type === 'checkbox') {
        newFormData = { ...newFormData, [name]: (e.target as HTMLInputElement).checked };
    } else if (name === 'solucionado') {
        newFormData = { ...newFormData, [name]: value === 'true' };
    }
    else {
        newFormData = { ...newFormData, [name]: value };
    }

    if (name === 'tipoIncidencia') {
        newFormData.detalleIncidencia = '';
    }

    setFormData(newFormData);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteEncontrado) {
      alert('Debe buscar y seleccionar un paciente.');
      return;
    }
    if (!formData.tipoIncidencia || !formData.detalleIncidencia) {
        alert('Por favor, seleccione el tipo y detalle de la incidencia.');
        return;
    }
    onSave(formData as Incidencia);
  };
  
  const handleDelete = () => {
    if (incidencia && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar la incidencia registrada para "${incidencia.nombrePaciente}"? Esta acción no se puede deshacer.`,
            () => {
                onDelete(incidencia.id);
                onClose();
            }
        );
    }
  };

  const formIsDisabled = !pacienteEncontrado;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={incidencia ? 'Editar Incidencia' : 'Registrar Nueva Incidencia'}
      footer={
        <div className="w-full flex justify-between items-center">
            {incidencia && onDelete ? (
                 <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                    <TrashIcon className="mr-2 h-5 w-5" />
                    Eliminar
                </button>
            ) : <div />}
            <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225] transition-colors">Guardar Incidencia</button>
            </div>
        </div>
      }
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-bold px-2 text-black">1. Buscar Paciente</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="historiaSearch" className="mb-1 text-sm font-medium text-gray-700">N° de Historia Clínica</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="historiaSearch"
                                value={historiaSearch}
                                onChange={(e) => setHistoriaSearch(e.target.value)}
                                className="flex-grow border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black"
                                disabled={!!pacienteEncontrado}
                            />
                            {!pacienteEncontrado ? (
                                <button type="button" onClick={handleHistoriaSearch} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Buscar</button>
                            ) : (
                                <button type="button" onClick={handleResetSearch} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600">Limpiar</button>
                            )}
                        </div>
                    </div>
                     {pacienteEncontrado && (
                        <div>
                             <p className="mb-1 text-sm font-medium text-gray-700">Paciente</p>
                             <p className="border bg-gray-100 border-gray-300 rounded-md shadow-sm text-sm p-2 font-semibold text-gray-900">{pacienteEncontrado.nombres} {pacienteEncontrado.apellidos}</p>
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md disabled:opacity-50" disabled={formIsDisabled}>
                 <legend className="text-md font-bold px-2 text-black">2. Detalles de la Incidencia</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div>
                        <label htmlFor="fecha" className="mb-1 text-sm font-medium text-gray-700">Fecha</label>
                        <input type="date" id="fecha" name="fecha" value={formatDateForInput(formData.fecha)} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" style={{ colorScheme: 'light' }} />
                    </div>
                    <div>
                        <label htmlFor="hora" className="mb-1 text-sm font-medium text-gray-700">Hora</label>
                        <input type="time" id="hora" name="hora" value={formatTimeForInput(formData.hora) || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" style={{ colorScheme: 'light' }} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                     <div>
                        <label htmlFor="tipoIncidencia" className="mb-1 text-sm font-medium text-gray-700">Tipo de Incidencia</label>
                        <select id="tipoIncidencia" name="tipoIncidencia" value={formData.tipoIncidencia || ''} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                            <option value="">Seleccionar tipo...</option>
                            {TIPO_INCIDENCIA_OPTIONS.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                        </select>
                     </div>
                     <div>
                        <label htmlFor="detalleIncidencia" className="mb-1 text-sm font-medium text-gray-700">Detalle</label>
                        <select id="detalleIncidencia" name="detalleIncidencia" value={formData.detalleIncidencia || ''} onChange={handleChange} disabled={!formData.tipoIncidencia} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black disabled:bg-gray-100">
                             <option value="">Seleccionar detalle...</option>
                             {formData.tipoIncidencia && INCIDENCIA_TYPES[formData.tipoIncidencia]?.map(detalle => <option key={detalle} value={detalle}>{detalle}</option>)}
                        </select>
                     </div>
                 </div>
                 
                 <div className="mt-4">
                    <label htmlFor="descripcion" className="mb-1 text-sm font-medium text-gray-700">Descripción</label>
                    <textarea id="descripcion" name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows={4} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black" />
                 </div>

                 <div className="mt-4">
                     <label htmlFor="solucionado" className="mb-1 text-sm font-medium text-gray-700">¿Se solucionó?</label>
                     <select id="solucionado" name="solucionado" value={formData.solucionado ? 'true' : 'false'} onChange={handleChange} className="w-full border-black bg-[#f9f9fa] rounded-md shadow-sm text-sm p-2 text-black">
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                     </select>
                 </div>
            </fieldset>

        </form>
      </div>
    </Modal>
  );
};

export default IncidenciaFormModal;