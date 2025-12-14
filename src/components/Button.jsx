import React from "react";
export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
    >
      {children}
    </button>
  );
}

