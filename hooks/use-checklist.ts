// hooks/use-checklist.ts
import { useState, useCallback } from 'react';
import type {
  MobileChecklistState,
  DatabaseEmployee,
  DatabaseEquipment,
} from '@/lib/types';

// Omitindo a propriedade 'photos' do estado inicial
const initialState: Omit<MobileChecklistState, 'photos'> = {
  step: 'validation',
  employee: null,
  action: null,
  equipment: null,
  responses: {},
  observations: '',
  hasIssues: false,
};

export function useChecklist() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEmployee = useCallback((employee: DatabaseEmployee) => {
    setState((prev) => ({ ...prev, employee, step: 'action' }));
  }, []);

  const setAction = useCallback((action: 'taking' | 'returning') => {
    setState((prev) => ({ ...prev, action, step: 'equipment' }));
  }, []);

  const setEquipment = useCallback((equipment: DatabaseEquipment) => {
    setState((prev) => ({ ...prev, equipment, step: 'checklist' }));
  }, []);

  const updateResponse = useCallback((field: string, value: any) => {
    setState((prev) => ({
      ...prev,
      responses: { ...prev.responses, [field]: value },
    }));
  }, []);

  const updateObservations = useCallback((observations: string) => {
    setState((prev) => ({ ...prev, observations }));
  }, []);

  // Funções de foto removidas

  const toggleIssue = useCallback((hasIssues: boolean) => {
    setState((prev) => ({ ...prev, hasIssues }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
  }, []);

  const validateEmployeeInternal = useCallback(async (matricula: string): Promise<DatabaseEmployee | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/employees/validate-matricula?matricula=${encodeURIComponent(matricula)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Funcionário não encontrado');
      }

      const result = await response.json();
      return result.employee;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateEmployee = useCallback(async (matricula: string): Promise<boolean> => {
    const employee = await validateEmployeeInternal(matricula);
    if (employee) {
      setEmployee(employee);
      return true;
    }
    return false;
  }, [validateEmployeeInternal, setEmployee]);

  const submitChecklist = useCallback(async (isEquipmentReady: boolean): Promise<boolean> => {
    if (!state.employee || !state.equipment || !state.action) {
      setError('Dados incompletos para submissão');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const equipmentStatus = state.action === 'taking' 
        ? (isEquipmentReady ? 'available' : 'maintenance')
        : state.hasIssues 
        ? 'maintenance' 
        : 'available';

      const payload = {
        employee_id: state.employee.id,
        equipment_id: state.equipment.id,
        action: state.action,
        checklist_responses: state.responses,
        observations: state.observations || null,
        has_issues: state.hasIssues,
        device_timestamp: new Date().toISOString(),
        // Array de fotos foi removido do payload
        equipment_status: equipmentStatus,
        is_equipment_ready: isEquipmentReady,
      };

      console.log('Enviando payload:', payload);

      const response = await fetch('/api/checklist/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao submeter checklist');
      }

      const result = await response.json();
      console.log('Checklist enviado com sucesso:', result);

      setState((prev) => ({ ...prev, step: 'success' }));
      return true;
    } catch (err: any) {
      console.error('Erro no submitChecklist:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state]);

  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case 'action':
          return { ...prev, step: 'validation', employee: null, action: null };
        case 'equipment':
          return { ...prev, step: 'action', action: null, equipment: null };
        case 'checklist':
          return {
            ...prev,
            step: 'equipment',
            equipment: null,
            responses: {},
            observations: '',
            hasIssues: false,
          };
        default:
          return prev;
      }
    });
  }, []);

  return {
    state,
    setState,
    loading,
    error,
    setEmployee,
    setAction,
    setEquipment,
    updateResponse,
    updateObservations,
    // addPhoto e removePhoto removidos
    toggleIssue,
    reset,
    validateEmployee,
    submitChecklist,
    goBack,
  };
}