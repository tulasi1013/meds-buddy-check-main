import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '@/services/medicationService';
import { Medication, MedicationFormData } from '@/types/medication';
import { useAuth } from '@/contexts/AuthContext';

export const useMedications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || '';

  // Fetch all medications
  const {
    data: medications = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Medication[]>({
    queryKey: ['medications', userId],
    queryFn: () => medicationService.getMedications(userId),
    enabled: !!userId,
  });

  // Create a new medication
  const createMedication = useMutation({
    mutationFn: (data: MedicationFormData) => 
      medicationService.createMedication(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Update a medication
  const updateMedication = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicationFormData> }) =>
      medicationService.updateMedication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Delete a medication
  const deleteMedication = useMutation({
    mutationFn: (id: string) => medicationService.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  return {
    medications,
    isLoading,
    error,
    refetch,
    createMedication,
    updateMedication,
    deleteMedication,
  };
};
