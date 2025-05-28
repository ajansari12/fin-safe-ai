
import { useState } from "react";

interface DialogContent {
  open: boolean;
  type: string;
  title: string;
  content: React.ReactNode;
}

export function useFrameworkDialog() {
  const [dialogContent, setDialogContent] = useState<DialogContent>({
    open: false,
    type: "",
    title: "",
    content: null,
  });

  function closeDialog() {
    setDialogContent({ ...dialogContent, open: false });
  }

  function openDialog(type: string, title: string, content: React.ReactNode) {
    setDialogContent({
      open: true,
      type,
      title,
      content,
    });
  }

  return {
    dialogContent,
    setDialogContent,
    closeDialog,
    openDialog
  };
}
