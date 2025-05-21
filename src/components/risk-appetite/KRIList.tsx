
import React, { useState } from 'react';
import { KRIDefinition } from '@/pages/risk-management/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { KRIForm } from './KRIForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface KRIListProps {
  thresholdId: string;
  kris: Partial<KRIDefinition>[];
  onAddKRI: (kri: Partial<KRIDefinition>) => void;
  onUpdateKRI: (kri: Partial<KRIDefinition>) => void;
  onDeleteKRI: (kriId: string) => void;
}

export function KRIList({ thresholdId, kris, onAddKRI, onUpdateKRI, onDeleteKRI }: KRIListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingKRI, setEditingKRI] = useState<Partial<KRIDefinition> | null>(null);

  const handleAddClick = () => {
    setEditingKRI(null);
    setShowForm(true);
  };

  const handleEditClick = (kri: Partial<KRIDefinition>) => {
    setEditingKRI(kri);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingKRI(null);
  };

  const handleSubmitKRI = (kri: Partial<KRIDefinition>) => {
    if (editingKRI?.id) {
      onUpdateKRI({ ...kri, id: editingKRI.id });
    } else {
      onAddKRI(kri);
    }
    setShowForm(false);
    setEditingKRI(null);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Key Risk Indicators</CardTitle>
            <CardDescription>Define KRIs for measuring and monitoring risk levels</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddClick}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add KRI
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <KRIForm 
            thresholdId={thresholdId}
            initialData={editingKRI || undefined}
            onSubmit={handleSubmitKRI}
            onCancel={handleCancelForm}
          />
        )}
        
        {kris.length === 0 && !showForm ? (
          <div className="text-center py-8 text-muted-foreground">
            No KRIs defined yet. Click "Add KRI" to define indicators for this risk category.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {kris.map((kri) => (
              <div key={kri.id || `temp-${kri.name}`} className="flex justify-between items-start border p-4 rounded-md">
                <div>
                  <h4 className="font-medium">{kri.name}</h4>
                  <p className="text-sm text-muted-foreground">{kri.description}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Target:</span> {kri.target_value}
                    </div>
                    <div>
                      <span className="font-medium">Warning:</span> {kri.warning_threshold}
                    </div>
                    <div>
                      <span className="font-medium">Critical:</span> {kri.critical_threshold}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Measured {kri.measurement_frequency}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick(kri)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {kri.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete KRI</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this KRI? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteKRI(kri.id!)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
