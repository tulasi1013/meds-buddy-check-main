import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationTrackingService } from '@/services/medicationTrackingService';

export const useMedicationTracking = (medicationId?: string) => {
  const queryClient = useQueryClient();

  // Get today's medication logs
  const { data: todayLogs, isLoading: isLoadingTodayLogs } = useQuery({
    queryKey: ['medicationLogs', 'today'],
    queryFn: () => medicationTrackingService.getTodaysLogs(),
  });

  // Get logs for a specific medication
  const { data: medicationLogs, isLoading: isLoadingMedicationLogs } = useQuery({
    queryKey: ['medicationLogs', medicationId],
    queryFn: () => medicationTrackingService.getMedicationLogs(medicationId!), 
    enabled: !!medicationId,
  });

  // Mark medication as taken
  const markAsTaken = useMutation({
    mutationFn: (notes?: string) => 
      medicationTrackingService.logMedicationTaken(medicationId!, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Delete a log entry
  const deleteLog = useMutation({
    mutationFn: (logId: string) => 
      medicationTrackingService.deleteLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Check if a medication has been taken today
  const isTakenToday = (medId: string) => {
    return todayLogs?.some(log => log.medication_id === medId) || false;
  };

  return {
    todayLogs,
    medicationLogs,
    isLoading: isLoadingTodayLogs || isLoadingMedicationLogs,
    markAsTaken,
    deleteLog,
    isTakenToday,
  };
};
