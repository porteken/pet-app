"use client";
import { Modal as MantineModal } from "@mantine/core";
import { ReactNode } from "react";

interface ModalProperties {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

export default function Modal({
  children,
  onClose,
  open,
  title,
}: Readonly<ModalProperties>) {
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
}
