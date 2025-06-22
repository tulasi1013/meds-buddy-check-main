import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useMedications } from '@/hooks/useMedications';
import { useMedicationTracking } from '@/hooks/useMedicationTracking';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const navigate = useNavigate();
  const { medications, isLoading: isLoadingMedications } = useMedications();
  const { todayLogs, isLoading: isLoadingLogs, isTakenToday } = useMedicationTracking();

  if (isLoadingMedications || isLoadingLogs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const takenCount = medications.filter(med => isTakenToday(med.id!)).length;
  const totalCount = medications.length;
  const progress = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  const pendingCount = totalCount - takenCount;

  // Get today's date in a nice format
  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d, yyyy');

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your medication overview for {todayFormatted}
          </p>
        </div>
        <Button onClick={() => navigate('/medications')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {/* Stats Cards */}
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
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingCount === 1 ? 'Medication' : 'Medications'} remaining today
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
              {todayLogs?.length 
                ? format(new Date(todayLogs[0].taken_at), 'h:mm a') 
                : '--:--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last medication taken
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Medications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today's Medications</h2>
        
        {Object.entries(medicationsByTime).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(medicationsByTime).map(([time, meds]) => (
              <Card key={time}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {time === 'Other' ? 'Other Medications' : `At ${time}`}
                    </CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {meds.length} {meds.length === 1 ? 'medication' : 'medications'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {meds.map((medication) => {
                    const isTaken = isTakenToday(medication.id!);
                    const log = todayLogs?.find(log => log.medication_id === medication.id);
                    
                    return (
                      <div 
                        key={medication.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${isTaken ? 'bg-green-50' : 'bg-amber-50'}`}
                      >
                        <div>
                          <div className="font-medium">{medication.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {medication.dosage}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${isTaken ? 'text-green-700' : 'text-amber-700'}`}>
                            {isTaken 
                              ? `Taken at ${log ? format(new Date(log.taken_at), 'h:mm a') : 'today'}`
                              : 'Pending'}
                          </span>
                          <Button
                            variant={isTaken ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => navigate(`/medications`)}
                          >
                            {isTaken ? 'Undo' : 'Mark as taken'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No medications scheduled for today.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => navigate('/medications')}
              >
                Add your first medication
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            {todayLogs && todayLogs.length > 0 ? (
              <div className="space-y-4">
                {todayLogs.slice(0, 5).map((log) => {
                  const medication = medications.find(m => m.id === log.medication_id);
                  if (!medication) return null;
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Taken at {format(new Date(log.taken_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activity recorded yet today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
