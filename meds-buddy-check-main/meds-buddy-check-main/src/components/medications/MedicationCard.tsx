import { Button } from '@/components/ui/button';
import { Check, X, Clock, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Medication } from '@/types/medication';

interface MedicationCardProps {
  medication: Medication;
  isTaken: boolean;
  lastTaken?: string;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onMarkAsTaken: (medication: Medication) => void;
}

export function MedicationCard({
  medication,
  isTaken,
  lastTaken,
  onEdit,
  onDelete,
  onMarkAsTaken,
}: MedicationCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{medication.name}</h3>
          <p className="text-sm text-muted-foreground">
            {medication.dosage} • {medication.frequency}
          </p>
          {medication.time && (
            <p className="text-sm text-muted-foreground">
              Time: {medication.time}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isTaken ? 'outline' : 'default'}
            size="sm"
            onClick={() => onMarkAsTaken(medication)}
          >
            {isTaken ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            {isTaken ? 'Taken' : 'Mark as taken'}
          </Button>
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
            onClick={() => onDelete(medication.id!)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      {medication.notes && (
        <p className="text-sm text-muted-foreground">
          {medication.notes}
        </p>
      )}
      
      {lastTaken && (
        <div className="text-xs text-muted-foreground">
          Last taken: {format(new Date(lastTaken), 'MMM d, yyyy h:mm a')}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {isTaken ? (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Check className="h-3 w-3 mr-1" /> Taken today
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )}
      </div>
    </div>
  );
}
