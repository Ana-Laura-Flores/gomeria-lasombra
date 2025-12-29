import React from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
  actions,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md relative">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{title}</h2>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xl font-bold text-gray-400 hover:text-white"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="mb-6 text-gray-300">
          {children}
        </div>

        {/* ACTIONS */}
        {actions && (
          <div className="flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
