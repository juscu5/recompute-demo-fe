import { useState } from "react";
import { DialogButton } from "../types/GlobalDialogTypes";

export const useGlobalDialogCtrl = () => {
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<{
    dialogSize?: "xs" | "sm" | "md" | "lg" | "xl";
    dialogTitle: string;
    dialogContext: string | JSX.Element | React.ReactNode;
    dialogOnClick: DialogButton[];
  }>({ dialogTitle: "", dialogContext: "", dialogOnClick: [] });

  return {
    isDialogOpen,
    setDialogOpen,
    dialogContent,
    setDialogContent,
  };
};
