import { useState, useCallback, useRef } from 'react';

export enum OptimisticStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

interface OptimisticAction<T> {
  id: string;
  data: T;
  status: OptimisticStatus;
  timestamp: number;
  error?: Error;
}

interface UseOptimisticUIOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, data: T) => void;
  timeout?: number; // Auto-remove successful actions after this time
}

interface UseOptimisticUIReturn<T> {
  pendingActions: OptimisticAction<T>[];
  addOptimisticAction: (data: T, operation: () => Promise<T>) => Promise<T>;
  removeAction: (id: string) => void;
  retryAction: (id: string) => Promise<void>;
  clearAll: () => void;
}

export function useOptimisticUI<T>({
  onSuccess,
  onError,
  timeout = 3000
}: UseOptimisticUIOptions<T> = {}): UseOptimisticUIReturn<T> {
  const [pendingActions, setPendingActions] = useState<OptimisticAction<T>[]>([]);
  const operationsRef = useRef<Map<string, () => Promise<T>>>(new Map());

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<OptimisticAction<T>>) => {
    setPendingActions(prev => 
      prev.map(action => 
        action.id === id ? { ...action, ...updates } : action
      )
    );
  }, []);

  const removeAction = useCallback((id: string) => {
    setPendingActions(prev => prev.filter(action => action.id !== id));
    operationsRef.current.delete(id);
  }, []);

  const addOptimisticAction = useCallback(async (data: T, operation: () => Promise<T>): Promise<T> => {
    const id = generateId();
    
    // Add optimistic action immediately
    const action: OptimisticAction<T> = {
      id,
      data,
      status: OptimisticStatus.PENDING,
      timestamp: Date.now()
    };

    setPendingActions(prev => [...prev, action]);
    operationsRef.current.set(id, operation);

    try {
      // Perform the actual operation
      const result = await operation();
      
      // Mark as successful
      updateAction(id, { 
        status: OptimisticStatus.SUCCESS,
        data: result 
      });
      
      onSuccess?.(result);

      // Auto-remove after timeout
      setTimeout(() => {
        removeAction(id);
      }, timeout);

      return result;
    } catch (error) {
      // Mark as error but keep the action for retry
      updateAction(id, { 
        status: OptimisticStatus.ERROR,
        error: error as Error 
      });
      
      onError?.(error as Error, data);
      throw error;
    }
  }, [generateId, updateAction, removeAction, timeout, onSuccess, onError]);

  const retryAction = useCallback(async (id: string): Promise<void> => {
    const operation = operationsRef.current.get(id);
    const action = pendingActions.find(a => a.id === id);
    
    if (!operation || !action) {
      throw new Error('Action not found');
    }

    // Reset to pending status
    updateAction(id, { status: OptimisticStatus.PENDING, error: undefined });

    try {
      const result = await operation();
      
      updateAction(id, { 
        status: OptimisticStatus.SUCCESS,
        data: result 
      });
      
      onSuccess?.(result);

      setTimeout(() => {
        removeAction(id);
      }, timeout);
    } catch (error) {
      updateAction(id, { 
        status: OptimisticStatus.ERROR,
        error: error as Error 
      });
      
      onError?.(error as Error, action.data);
      throw error;
    }
  }, [pendingActions, updateAction, removeAction, timeout, onSuccess, onError]);

  const clearAll = useCallback(() => {
    setPendingActions([]);
    operationsRef.current.clear();
  }, []);

  return {
    pendingActions,
    addOptimisticAction,
    removeAction,
    retryAction,
    clearAll
  };
}