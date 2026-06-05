import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Info } from "lucide-react";

/**
 * Friendly reminder shown to staff/builder accounts when they try to install a
 * component that is NOT a Magna Dev component. It does not block them — it just
 * reminds them of policy, then routes them to the proper pay gate on confirm.
 */
export default function NonMagnaReminderDialog({ open, onOpenChange, componentName, onProceed }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-600" /> Heads up — third-party component
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              <strong>{componentName}</strong> is a third-party component, not a Magna Dev
              component. Staff and builder accounts are only provisioned with Magna Dev
              components.
            </span>
            <span className="block">
              You can still purchase this through the standard checkout — you'll be taken
              to the secure pay gate to complete the subscription.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-violet-700 hover:bg-violet-800"
            onClick={onProceed}
          >
            Continue to checkout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}