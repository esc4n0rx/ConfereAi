// hooks/use-checklist.ts
import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression'; // <-- ADICIONADO
import type {
  MobileChecklistState,
  DatabaseEmployee,
  DatabaseEquipment,
} from '@/lib/types';

const initialState: MobileChecklistState = {
  step: 'validation',
  employee: null,
  action: null,
  equipment: null,
  responses: {},
  observations: '',
  photos: [],
  hasIssues: false,
};

export function useChecklist() {
  const [state, setState] = useState<MobileChecklistState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NOVA FUNÇÃO DE COMPRESSÃO ---
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2, // Tamanho máximo do arquivo em MB
      maxWidthOrHeight: 1920, // Redimensiona para no máximo 1920px
      useWebWorker: true, // Usa Web Worker para não travar a UI
    };
    try {
      console.log(`Tamanho original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Tamanho comprimido: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      return compressedFile;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      // Retorna o arquivo original se a compressão falhar
      return file;
    }
  };
  // --- FIM DA NOVA FUNÇÃO ---


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

  // --- FUNÇÃO addPhoto ATUALIZADA ---
  const addPhoto = useCallback(async (photo: File) => {
    try {
      setLoading(true); // Feedback de carregamento durante a compressão
      const compressedPhoto = await compressImage(photo);
      setState((prev) => ({
        ...prev,
        photos: [...prev.photos, compressedPhoto],
      }));
    } catch (err) {
      setError("Não foi possível processar a imagem.");
    } finally {
      setLoading(false);
    }
  }, []);
  // --- FIM DA ATUALIZAÇÃO ---


  const removePhoto = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }, []);

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

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          const base64String = reader.result as string;
          resolve(base64String);
        } else {
          reject(new Error('Erro ao ler arquivo'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao converter arquivo para base64'));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  const submitChecklist = useCallback(async (isEquipmentReady: boolean): Promise<boolean> => {
    if (!state.employee || !state.equipment || !state.action) {
      setError('Dados incompletos para submissão');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const photosBase64: string[] = [];
      
      console.log(`Convertendo ${state.photos.length} fotos para base64...`);
      
      for (let i = 0; i < state.photos.length; i++) {
        const photo = state.photos[i];
        
        try {
          const base64 = await convertFileToBase64(photo);
          photosBase64.push(base64);
          console.log(`Foto ${i + 1} convertida com sucesso`);
        } catch (conversionError) {
          console.error(`Erro ao converter foto ${i + 1}:`, conversionError);
          throw new Error(`Erro ao processar foto ${i + 1}. Tente tirar a foto novamente.`);
        }
      }

      console.log(`${photosBase64.length} fotos convertidas para base64`);

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
        photos: photosBase64,
        equipment_status: equipmentStatus,
        is_equipment_ready: isEquipmentReady,
      };

      console.log('Enviando payload:', {
        ...payload,
        photos: `${payload.photos.length} fotos`,
      });

      const response = await fetch('/api/checklist/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao submeter checklist';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta de erro:', parseError);
          try {
            const errorText = await response.text();
            console.error('Resposta de erro como texto:', errorText);
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          } catch (textError) {
            console.error('Erro ao ler resposta como texto:', textError);
          }
        }
        
        throw new Error(errorMessage);
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
  }, [state, convertFileToBase64]);

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
    addPhoto,
    removePhoto,
    toggleIssue,
    reset,
    validateEmployee,
    submitChecklist,
  };
}