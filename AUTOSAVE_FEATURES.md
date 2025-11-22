# Sistema de Guardado en Tiempo Real

Este sistema implementa técnicas avanzadas de UX para proporcionar una experiencia de guardado fluida y elegante.

## Características Implementadas

### 1. Auto-Save (Guardado Automático)
- **Hook personalizado `useAutoSave`**: Guarda cambios automáticamente cada 2 segundos
- **Solo para leads existentes**: Los leads nuevos requieren guardado manual
- **Detección inteligente de cambios**: Solo guarda cuando hay cambios reales
- **Estado de guardado**: Tracking completo del estado (idle, saving, saved, error)

### 2. Indicadores Visuales Elegantes
- **Componente `SaveIndicator`**: Muestra el estado actual de guardado
- **Estados visuales**:
  - 🔄 "Guardando..." (spinner azul)
  - ✅ "¡Guardado!" (checkmark verde con animación)
  - ⚠️ "Error al guardar" (icono de error rojo)
  - 🟠 "Cambios sin guardar" (punto naranja pulsante)
- **Posicionamiento**: En el header del modal, no invasivo

### 3. Optimistic UI
- **Hook `useOptimisticUI`**: Para actualizaciones inmediatas en la interfaz
- **Feedback inmediato**: Los cambios aparecen instantáneamente
- **Manejo de errores**: Rollback automático en caso de fallo
- **Reintentos**: Posibilidad de reintentar operaciones fallidas

### 4. Feedback Visual para Procedimientos
- **Indicador de guardado**: Los procedimientos recién guardados se destacan visualmente
- **Animaciones sutiles**: Transiciones suaves y elegantes
- **Confirmación visual**: "✓ Guardado" aparece temporalmente

### 5. Botones Inteligentes
- **Guardar Ahora**: Solo habilitado cuando hay cambios sin guardar
- **Guardar y Cerrar**: Comportamiento diferenciado para leads nuevos vs existentes
- **Estados dinámicos**: Los botones reflejan el estado actual del guardado

## Hooks Creados

### `useAutoSave<T>`
```typescript
const { saveStatus, lastSaved, forceSave, hasUnsavedChanges } = useAutoSave({
  data: formData,
  onSave: async (data) => api.saveLead(data),
  delay: 2000,
  enabled: true,
  onError: (error) => console.error(error),
  onSuccess: (data) => console.log('Guardado exitoso')
});
```

### `useOptimisticUI<T>`
```typescript
const { pendingActions, addOptimisticAction, retryAction } = useOptimisticUI({
  onSuccess: (data) => console.log('Éxito'),
  onError: (error, data) => console.error(error),
  timeout: 3000
});
```

## Componentes Creados

### `SaveIndicator`
```typescript
<SaveIndicator 
  status={saveStatus}
  lastSaved={lastSaved}
  hasUnsavedChanges={hasUnsavedChanges}
  className="ml-4"
/>
```

## Experiencia de Usuario

### Flujo para Leads Existentes:
1. Usuario hace cambios → Se marca como "cambios sin guardar"
2. Después de 2 segundos → Auto-save inicia, muestra "Guardando..."
3. Al completarse → Muestra "¡Guardado!" brevemente
4. En caso de error → Muestra "Error al guardar" con opción de reintento

### Flujo para Procedimientos:
1. Usuario añade procedimiento → Se muestra inmediatamente con borde verde
2. Indicador "✓ Guardado" aparece por 2 segundos
3. Auto-save se encarga del guardado en segundo plano

### Botones Dinámicos:
- **Guardar Ahora**: Solo visible cuando hay cambios sin guardar
- **Guardar y Cerrar**: Para leads existentes, usa force-save + cierre
- **Crear Lead**: Para leads nuevos, comportamiento tradicional

## Beneficios

1. **Reduce la ansiedad del usuario**: Feedback constante sobre el estado
2. **Previene pérdida de datos**: Guardado automático frecuente
3. **Sensación de tiempo real**: Cambios aparecen inmediatamente
4. **Transparencia**: El usuario siempre sabe qué está pasando
5. **Elegancia**: Animaciones sutiles y no invasivas