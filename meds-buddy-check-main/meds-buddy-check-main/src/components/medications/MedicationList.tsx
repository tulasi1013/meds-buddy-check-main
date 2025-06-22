import { useState } from 'react';
import { Medication } from '@/types/medication';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useMedications } from '@/hooks/useMedications';
import { MedicationForm } from './MedicationForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type MedicationListProps = {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
};

export function MedicationList({ medications, onEdit, onDelete }: MedicationListProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);

  if (medications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No medications found. Add your first medication to get started.</p>
      </div>
    );
  }

  const handleDeleteClick = (id: string) => {
    setMedicationToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (medicationToDelete) {
      onDelete(medicationToDelete);
      setShowDeleteDialog(false);
      setMedicationToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((medication) => (
              <TableRow key={medication.id}>
                <TableCell className="font-medium">{medication.name}</TableCell>
                <TableCell>{medication.dosage}</TableCell>
                <TableCell>
                  {formatFrequency(medication.frequency)}
                </TableCell>
                <TableCell>
                  {format(new Date(`2000-01-01T${medication.time}`), 'h:mm a')}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {medication.notes || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(medication)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClick(medication.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    once: 'Once',
    twice: 'Twice a day',
    thrice: 'Three times a day',
    every_4_hours: 'Every 4 hours',
    every_6_hours: 'Every 6 hours',
    every_8_hours: 'Every 8 hours',
    as_needed: 'As needed',
  };
  return frequencyMap[frequency] || frequency;
}
