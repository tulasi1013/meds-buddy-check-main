import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Check, X, Clock, Pencil, Trash2 } from 'lucide-react';
import { useMedications } from '@/hooks/useMedications';
import { useMedicationTracking } from '@/hooks/useMedicationTracking';
import { MedicationForm } from '@/components/medications/MedicationForm';
import { MedicationCard } from '@/components/medications/MedicationCard';
import { Medication } from '@/types/medication';
import { MedicationDashboard } from '@/components/dashboard/MedicationDashboard';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Medications() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    medications,
    isLoading,
    createMedication,
    updateMedication,
    deleteMedication,
  } = useMedications();
  
  const { 
    todayLogs, 
    markAsTaken, 
    deleteLog,
    isTakenToday 
  } = useMedicationTracking();
  
  const handleMarkAsTaken = async (medication: Medication) => {
    try {
      setSelectedMedication(medication);
      if (!isTakenToday(medication.id!)) {
        await markAsTaken.mutateAsync(notes);
        toast({
          title: 'Medication marked as taken',
          description: `${medication.name} has been marked as taken for today.`,
        });
        setNotes('');
      } else {
        // Find today's log for this medication
        const log = todayLogs?.find(log => log.medication_id === medication.id);
        if (log) {
          await deleteLog.mutateAsync(log.id!);
          toast({
            title: 'Medication status updated',
            description: `Removed today's record for ${medication.name}.`,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update medication status.',
        variant: 'destructive',
      });
    } finally {
      setSelectedMedication(null);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingMedication) {
        await updateMedication.mutateAsync({
          id: editingMedication.id!,
          data,
        });
        toast({
          title: 'Medication updated',
          description: 'Your medication has been updated successfully.',
        });
      } else {
        await createMedication.mutateAsync(data);
        toast({
          title: 'Medication added',
          description: 'Your medication has been added successfully.',
        });
      }
      setIsFormOpen(false);
      setEditingMedication(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while saving the medication.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedication.mutateAsync(id);
      toast({
        title: 'Medication deleted',
        description: 'Your medication has been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the medication.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && !medications.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Medications</h1>
          <p className="text-muted-foreground">
            Manage your medications and track your daily intake
          </p>
        </div>
        <Button onClick={() => {
          setEditingMedication(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">All Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <MedicationDashboard />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                isTaken={isTakenToday(medication.id!)}
                lastTaken={todayLogs?.find(log => log.medication_id === medication.id)?.taken_at}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkAsTaken={handleMarkAsTaken}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Medication Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </DialogTitle>
          </DialogHeader>
          <MedicationForm
            initialData={editingMedication || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingMedication(null);
            }}
            isLoading={createMedication.isPending || updateMedication.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Mark as Taken Dialog */}
      <Dialog 
        open={!!selectedMedication} 
        onOpenChange={(open) => !open && setSelectedMedication(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Taken</DialogTitle>
            <DialogDescription>
              {isTakenToday(selectedMedication?.id!) 
                ? 'Remove this medication from today\'s log?'
                : `Mark ${selectedMedication?.name} as taken?`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this dose..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedMedication(null)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleMarkAsTaken(selectedMedication!)}
              disabled={markAsTaken.isPending || deleteLog.isPending}
            >
              {markAsTaken.isPending || deleteLog.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isTakenToday(selectedMedication?.id!) ? (
                'Remove'
              ) : (
                'Mark as Taken'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
