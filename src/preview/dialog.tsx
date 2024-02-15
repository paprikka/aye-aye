import { Signal, useSignalEffect } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

import styles from "./dialog.module.css";

export const Dialog = ({
  isVisible,
  title,
  children,
}: {
  isVisible: Signal<boolean>;
  title?: string;
  children: any;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useSignalEffect(() => {
    if (isVisible.value) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const closeDialog = () => (isVisible.value = false);
    dialog.addEventListener("close", closeDialog);
    return () => {
      dialog.removeEventListener("close", closeDialog);
    };
  });

  return (
    <dialog ref={dialogRef} className={styles.dialog}>
      <div className={styles.content}>
        {title && <h2>{title}</h2>}
        {children}
        <button
          aria-label={"Close"}
          className={styles.closeButton}
          onClick={() => (isVisible.value = false)}
        ></button>
      </div>
    </dialog>
  );
};
