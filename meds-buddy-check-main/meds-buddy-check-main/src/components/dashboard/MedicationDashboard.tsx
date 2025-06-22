import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useMedications } from '@/hooks/useMedications';
import { useMedicationTracking } from '@/hooks/useMedicationTracking';
import { format } from 'date-fns';

export function MedicationDashboard() {
  const { medications, isLoading } = useMedications();
  const { todayLogs, isTakenToday } = useMedicationTracking();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const takenCount = medications.filter(med => isTakenToday(med.id!)).length;
  const totalCount = medications.length;
  const progress = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Group medications by time
  const medicationsByTime = medications.reduce((acc, med) => {
    const time = med.time || 'Other';
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(med);
    return acc;
  }, {} as Record<string, typeof medications>);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {takenCount} / {totalCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {progress}% of medications taken
            </p>
            <Progress value={progress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount - takenCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? 'Remaining medications for today' : 'No medications scheduled'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayLogs?.length ? format(new Date(todayLogs[0].taken_at), 'h:mm a') : '--:--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last medication taken
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {Object.entries(medicationsByTime).map(([time, meds]) => (
          <Card key={time}>
            <CardHeader>
              <CardTitle className="text-lg">
                {time === 'Other' ? 'Other Medications' : `At ${time}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meds.map((medication) => {
                  const isTaken = isTakenToday(medication.id!);
                  const log = todayLogs?.find(log => log.medication_id === medication.id);
                  
                  return (
                    <div 
                      key={medication.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {medication.dosage}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isTaken ? 'text-green-600' : 'text-amber-600'}`}>
                          {isTaken 
                            ? `Taken at ${log ? format(new Date(log.taken_at), 'h:mm a') : 'today'}`
                            : 'Pending'}
                        </span>
                        <Button
                          variant={isTaken ? 'outline' : 'default'}
                          size="sm"
                        >
                          {isTaken ? 'Undo' : 'Mark as taken'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
