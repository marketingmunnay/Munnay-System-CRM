import React, { useState, useEffect, useRef } from 'react';
import type { Publicacion } from '../../types.ts';
import { TipoPost, RedSocialPost } from '../../types.ts';
import Modal from '../shared/Modal.tsx';
import { TrashIcon, XMarkIcon } from '../shared/Icons.tsx';

interface PublicacionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pub: Publicacion) => void;
  onDelete: (pubId: number) => void;
  publicacion: Publicacion | null;
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const GoogleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const PublicacionFormModal: React.FC<PublicacionFormModalProps> = ({ isOpen, onClose, onSave, onDelete, publicacion, requestConfirmation }) => {
  const [formData, setFormData] = useState<Partial<Publicacion>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        const now = new Date();
        setFormData(publicacion ? { ...publicacion } : {
            id: Date.now(),
            fechaPost: now.toISOString().split('T')[0],
            horaPost: now.toTimeString().slice(0, 5),
            tipoPost: TipoPost.Reel,
            redSocial: RedSocialPost.Instagram,
            vistas: 0,
            comentarios: 0,
            reacciones: 0,
            conversacionesIniciadas: 0,
            convertidos: 0,
        });
    }
  }, [publicacion, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const base64Image = await toBase64(file);
        setFormData(prev => ({ ...prev, imageUrl: base64Image }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.temaVideo || !formData.publicacionUrl) {
      alert('El tema y la URL de la publicación son requeridos.');
      return;
    }
    onSave(formData as Publicacion);
  };

  const handleDelete = () => {
    if (publicacion && onDelete) {
        requestConfirmation(
            `¿Estás seguro de que quieres eliminar la publicación "${publicacion.temaVideo}"?`,
            () => {
                onDelete(publicacion.id);
                onClose();
            }
        );
    }
  };

  const renderField = (label: string, name: keyof Publicacion, type: 'text' | 'date' | 'url' | 'number' | 'time') => {
      if (type === 'date') {
          // Always show a valid date, fallback to today
          let value = '';
          const fieldValue = formData[name];
          if (fieldValue instanceof Date && !isNaN(fieldValue.getTime())) {
              value = fieldValue.toISOString().split('T')[0];
          } else if (typeof fieldValue === 'string' && fieldValue.length >= 8) {
              // Try to parse string
              const d = new Date(fieldValue);
              value = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          } else {
              value = new Date().toISOString().split('T')[0];
          }
          return (
              <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    style={{ colorScheme: 'light' }}
                />
              </div>
          );
      }
      if (type === 'time') {
          return (
              <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={String(formData[name] ?? '')}
                    onChange={handleChange}
                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                    style={{ colorScheme: 'light' }}
                />
              </div>
          );
      }
      return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={String(formData[name] ?? '')}
            onChange={handleChange}
            className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
        />
      </div>
  )};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={publicacion ? 'Editar Publicación' : 'Registrar Publicación'}
      maxWidthClass="max-w-7xl"
      footer={
        <div className="w-full flex justify-between items-center">
            {publicacion && (
                 <button onClick={handleDelete} className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                    <TrashIcon className="mr-2 h-5 w-5" /> Eliminar
                </button>
            )}
            <div className="space-x-2 ml-auto">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-[#aa632d] text-white rounded-md hover:bg-[#8e5225]">Guardar</button>
            </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderField('Fecha del post', 'fechaPost', 'date')}
            {renderField('Hora del post', 'horaPost', 'time')}
            <div className="md:col-span-2">
                {renderField('Tema del video', 'temaVideo', 'text')}
            </div>
            
            <div>
                <label htmlFor="tipoPost" className="block text-sm font-medium text-gray-700">Tipo de post</label>
                <select
                    id="tipoPost"
                    name="tipoPost"
                    value={formData.tipoPost || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                >
                    {Object.values(TipoPost).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="redSocial" className="block text-sm font-medium text-gray-700">Red social</label>
                <select
                    id="redSocial"
                    name="redSocial"
                    value={formData.redSocial || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-black bg-[#f9f9fa] text-black rounded-md shadow-sm p-2 focus:ring-1 focus:ring-[#aa632d] focus:border-[#aa632d]"
                >
                    {Object.values(RedSocialPost).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            
            <div className="md:col-span-2">
                {renderField('URL de la Publicación', 'publicacionUrl', 'url')}
            </div>

            <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700">Imagen de Portada</label>
                <div className="mt-1 flex items-center space-x-4">
                    {formData.imageUrl ? (
                    <div className="relative">
                        <img src={formData.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                        <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: undefined }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                        >
                        <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                    ) : (
                    <div className="h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border">
                        <GoogleIcon name="image" className="text-4xl" />
                    </div>
                    )}
                    <div>
                    <input
                        type="file"
                        id="imageUrl"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                    >
                        {formData.imageUrl ? 'Cambiar' : 'Seleccionar'} imagen
                    </button>
                    </div>
                </div>
            </div>
        </div>
        <hr/>
        <p className="font-semibold text-gray-700">Métricas</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {renderField('Vistas', 'vistas', 'number')}
            {renderField('Comentarios', 'comentarios', 'number')}
            {renderField('Reacciones', 'reacciones', 'number')}
            {renderField('Conversaciones Iniciadas', 'conversacionesIniciadas', 'number')}
            {/* FIX: Corrected typo 'convertidos' and completed the component file. */}
            {renderField('Convertidos', 'convertidos', 'number')}
        </div>
      </form>
    </Modal>
  );
};

export default PublicacionFormModal;