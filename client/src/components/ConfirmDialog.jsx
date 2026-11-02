import { useEffect, useId, useRef } from 'react'

// Accessible confirmation dialog. Focus starts on "Cancel" (the safe choice);
// Escape cancels.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const messageId = useId()
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  function handleKeyDown(event) {
    if (event.key === 'Escape' && !busy) onCancel()
  }

  return (
    <div className="dialog-backdrop">
      <div
        className="dialog card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
