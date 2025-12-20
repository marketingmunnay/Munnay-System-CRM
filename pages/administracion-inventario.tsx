import React from 'react';
import InventarioPage from '../components/administracion/InventarioPage';

const AdministracionInventarioPage = () => {
  // Aquí deberías obtener la lista de productos desde tu API o contexto global
  // Por simplicidad, se pasa un array vacío
  return <InventarioPage productos={[]} />;
};

export default AdministracionInventarioPage;
