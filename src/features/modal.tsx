"use client";
import { Modal as MantineModal } from "@mantine/core";
import React, { memo, type ReactNode } from "react";

interface ModalProperties {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

const Modal = memo<ModalProperties>(({ children, onClose, open, title }) => {
  return (
    <MantineModal
      centered
      closeOnClickOutside
      closeOnEscape
      onClose={onClose}
      opened={open}
      size="xl"
      title={title}
    >
      <div className="mb-6">{children}</div>
    </MantineModal>
  );
});

Modal.displayName = "Modal";

export default Modal;
