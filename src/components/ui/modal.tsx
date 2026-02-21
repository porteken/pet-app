"use client";

import React, { memo, type ReactNode } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ModalProperties {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

const Modal = memo<ModalProperties>(({ children, onClose, open, title }) => {
  return (
    <Dialog
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
    >
      <DialogContent aria-describedby={undefined}>
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        ) : (
          <DialogTitle className="sr-only">Details</DialogTitle>
        )}
        <div className="mt-4 mb-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
});

Modal.displayName = "Modal";

export default Modal;
