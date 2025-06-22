import { supabase } from '@/lib/supabase';

export type MedicationLog = {
  id?: string;
  medication_id: string;
  taken_at: string;
  user_id: string;
  notes?: string;
};

export const medicationTrackingService = {
  // Log a medication as taken
  logMedicationTaken: async (medicationId: string, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('medication_logs')
      .insert([
        { 
          medication_id: medicationId, 
          taken_at: new Date().toISOString(),
          user_id: user.id,
          notes
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get logs for a specific medication
  getMedicationLogs: async (medicationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all medication logs for the current day
  getTodaysLogs: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('medication_logs')
      .select(`
        *,
        medications!inner(*)
      `)
      .eq('user_id', user.id)
      .gte('taken_at', startOfDay)
      .lte('taken_at', endOfDay);

    if (error) throw error;
    return data;
  },

  // Delete a medication log
  deleteLog: async (logId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('medication_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  }
};
