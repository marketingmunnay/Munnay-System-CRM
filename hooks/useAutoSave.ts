import { useRef, useEffect, useCallback, useState } from 'react';

export enum SaveStatus {
  IDLE = 'idle',
  SAVING = 'saving', 
  SAVED = 'saved',
  ERROR = 'error'
}

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<T>;
  delay?: number; // milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (savedData: T) => void;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  forceSave: () => Promise<void>;
  hasUnsavedChanges: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 3000, // 3 seconds default
  enabled = true,
  onError,
  onSuccess
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.IDLE);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>();
  const isSavingRef = useRef(false);

  // Check if data has changed
  const hasChanged = useCallback((current: T, previous: T | undefined): boolean => {
    if (!previous) return false;
    return JSON.stringify(current) !== JSON.stringify(previous);
  }, []);

  const performSave = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;

    try {
      isSavingRef.current = true;
      setSaveStatus(SaveStatus.SAVING);
      setHasUnsavedChanges(false);
      
      const savedData = await onSave(data);
      
      setSaveStatus(SaveStatus.SAVED);
      setLastSaved(new Date());
      lastDataRef.current = savedData;
      
      onSuccess?.(savedData);
      
      // Auto-hide saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus(SaveStatus.IDLE);
      }, 2000);
      
    } catch (error) {
      setSaveStatus(SaveStatus.ERROR);
      setHasUnsavedChanges(true);
      onError?.(error as Error);
      
      // Auto-hide error status after 5 seconds
      setTimeout(() => {
        setSaveStatus(SaveStatus.IDLE);
      }, 5000);
      
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, onError, onSuccess]);

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave();
  }, [performSave]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || isSavingRef.current) return;

    const hasDataChanged = hasChanged(data, lastDataRef.current);
    
    if (hasDataChanged) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        performSave();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, hasChanged, performSave]);

  // Initialize last data ref
  useEffect(() => {
    if (!lastDataRef.current) {
      lastDataRef.current = data;
    }
  }, [data]);

  return {
    saveStatus,
    lastSaved,
    forceSave,
    hasUnsavedChanges
  };
}