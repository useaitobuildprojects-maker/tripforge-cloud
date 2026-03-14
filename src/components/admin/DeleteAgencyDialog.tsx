import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteAgency } from '@/hooks/use-agency-mutations';
import { Agency } from '@/types/agency';

interface DeleteAgencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agency: Agency | null;
}

const DeleteAgencyDialog = ({ open, onOpenChange, agency }: DeleteAgencyDialogProps) => {
  const deleteAgency = useDeleteAgency();

  const handleDelete = async () => {
    if (!agency) return;
    await deleteAgency.mutateAsync(agency.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Delete Agency</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{agency?.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteAgency.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
            {deleteAgency.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAgencyDialog;
