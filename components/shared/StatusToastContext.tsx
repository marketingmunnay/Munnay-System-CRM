import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastState = {
  isOpen: boolean;
  message: string;
};

type StatusToastContextType = {
  showStatus: (message: string, durationMs?: number) => void;
  hideStatus: () => void;
};

const StatusToastContext = createContext<StatusToastContextType | null>(null);

export const useStatusToast = (): StatusToastContextType => {
  const ctx = useContext(StatusToastContext);
  if (!ctx) throw new Error('useStatusToast must be used within StatusToastProvider');
  return ctx;
};

export const StatusToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: '' });
  const [timer, setTimer] = useState<number | null>(null);

  const hideStatus = useCallback(() => {
    setToast({ isOpen: false, message: '' });
    if (timer) {
      window.clearTimeout(timer);
      setTimer(null);
    }
  }, [timer]);

  const showStatus = useCallback((message: string, durationMs: number = 2500) => {
    // Reset previous timer
    if (timer) {
      window.clearTimeout(timer);
      setTimer(null);
    }
    setToast({ isOpen: true, message });
    const id = window.setTimeout(() => {
      setToast({ isOpen: false, message: '' });
      setTimer(null);
    }, durationMs);
    setTimer(id);
  }, [timer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [timer]);

  return (
    <StatusToastContext.Provider value={{ showStatus, hideStatus }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 flex justify-center z-50">
        <div className={`transform transition-all duration-200 ${toast.isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="pointer-events-auto bg-black/80 text-white text-sm px-4 py-2 rounded-full shadow-md backdrop-blur-sm">
            {toast.message}
          </div>
        </div>
      </div>
    </StatusToastContext.Provider>
  );
};

export default StatusToastProvider;
