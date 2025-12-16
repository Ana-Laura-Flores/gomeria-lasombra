import React from "react";

export default function Select({ label, value, onChange, options }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-gray-200 mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none"
      >
        <option value="">Seleccionar</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.servicio} - ${opt.precio}
          </option>
        ))}
      </select>
    </div>
  );
}
