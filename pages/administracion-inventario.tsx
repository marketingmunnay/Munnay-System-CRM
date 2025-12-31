
import React, { useEffect, useState } from 'react';
import InventarioPage from '../components/administracion/InventarioPage';
import * as api from '../services/api';

const AdministracionInventarioPage = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await api.getProducts();
        setProductos(data);
      } catch (error) {
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Cargando productos...</div>;
  }

  return <InventarioPage productos={productos} />;
};

export default AdministracionInventarioPage;
