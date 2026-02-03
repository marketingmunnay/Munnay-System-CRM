import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = React.useState(false);
  let timeout: NodeJS.Timeout;

  const show = () => {
    timeout = setTimeout(() => setVisible(true), 250);
  };
  const hide = () => {
    clearTimeout(timeout);
    setVisible(false);
  };

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-black text-white text-xs whitespace-nowrap shadow-lg animate-fade-in">
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
