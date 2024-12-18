import { GlobalDialogProps } from "@/_shared/types/GlobalDialogTypes";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const GlobalDialog = ({
  isDialogOpen,
  setDialogOpen,
  title,
  context,
  buttonText,
  dialogSize,
}: GlobalDialogProps) => {
  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={handleClose}
      fullWidth
      maxWidth={dialogSize || "xs"}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{context}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {buttonText?.map((data: any, idx: number) => {
          return (
            <Button key={idx} onClick={data.onClick} color={data.textColor}>
              {data.text}
            </Button>
          );
        })}
      </DialogActions>
    </Dialog>
  );
};
