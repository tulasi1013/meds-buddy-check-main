export type Medication = {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type MedicationFormData = Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
