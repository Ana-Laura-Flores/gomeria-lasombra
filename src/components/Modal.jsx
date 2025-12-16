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
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <div className="mb-6 text-gray-300">
          {children}
        </div>

        <div className="flex justify-end gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}
