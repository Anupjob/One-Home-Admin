import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ReusableModal = ({
  open,
  handleClose,
  title,
  children,
  actions,
  maxWidth = "md"
}) => {
  return (
    <Dialog
  open={open}
  onClose={handleClose}
  fullWidth
  maxWidth="md"
  scroll="paper"
  sx={{
    "& .MuiDialog-paper": {
      maxHeight: "75vh",
      margin: "20px"
    }
  }}
>
      
      {/* Header */}
      <DialogTitle
      sx={{padding:"0"}}
      >
        <div style={{ position: "absolute", left: 10, top: 10 }}>
        {title}
        </div>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Scrollable Content */}
      <DialogContent dividers>
        {children}
      </DialogContent>

      {/* Footer Actions */}
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}

    </Dialog>
  );
};

export default ReusableModal;