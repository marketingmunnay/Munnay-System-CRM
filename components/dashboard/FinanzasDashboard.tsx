import React from 'react';
import PlaceholderPage from '../shared/PlaceholderPage'; // Import PlaceholderPage

interface FinanzasDashboardProps {
    dateRange: { from: string; to: string };
}

const FinanzasDashboard: React.FC<FinanzasDashboardProps> = ({ dateRange }) => {
  // Use PlaceholderPage to indicate that this section is under construction
  return (
    <PlaceholderPage
      title="Panel de Finanzas"
      // You can add more props if needed, or simply pass the title
    />
  );
};

export default FinanzasDashboard;