import React from "react";


// src/components/Input.jsx
export default function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-gray-200 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
         className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100 placeholder-gray-400"
      />
    </div>
  );
}
