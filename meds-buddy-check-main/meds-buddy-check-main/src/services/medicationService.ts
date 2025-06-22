import { supabase } from '@/lib/supabase';
import { Medication, MedicationFormData } from '@/types/medication';

export const medicationService = {
  // Get all medications for the current user
  getMedications: async (userId: string): Promise<Medication[]> => {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }

    return data || [];
  },

  // Get a single medication by ID
  getMedication: async (id: string): Promise<Medication | null> => {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching medication:', error);
      return null;
    }

    return data;
  },

  // Create a new medication
  createMedication: async (medication: MedicationFormData, userId: string): Promise<Medication> => {
    const { data, error } = await supabase
      .from('medications')
      .insert([{ ...medication, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating medication:', error);
      throw error;
    }

    return data;
  },

  // Update an existing medication
  updateMedication: async (id: string, updates: Partial<MedicationFormData>): Promise<Medication> => {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating medication:', error);
      throw error;
    }

    return data;
  },

  // Delete a medication
  deleteMedication: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },
};
