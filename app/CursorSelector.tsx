"use client";
import React, { useEffect, useState } from "react";

const CURSORS = [
  {
    name: "Default",
    file: "",
  },
  {
    name: "Watering Can",
    file: "/watering-can.png",
  },
];

export default function CursorSelector() {
  const [selected, setSelected] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selected-cursor") || CURSORS[0].file;
    }
    return CURSORS[0].file;
  });

  useEffect(() => {
    if (selected) {
      document.body.style.cursor = `url('${selected}') 0 0, auto`;
    } else {
      document.body.style.cursor = "auto";
    }
    localStorage.setItem("selected-cursor", selected);
  }, [selected]);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 border-b border-gray-200 sticky top-0 z-50">
      <span className="font-semibold mr-2">Choose your cursor:</span>
      {CURSORS.map((cursor) => (
        <button
          key={cursor.name}
          onClick={() => setSelected(cursor.file)}
          className={`flex flex-col items-center px-2 py-1 rounded border-2 transition-all ${selected === cursor.file ? "border-blue-500 bg-blue-50" : "border-transparent hover:border-gray-300"}`}
          style={{ outline: "none" }}
        >
          {cursor.file ? (
            <img
              src={cursor.file}
              alt={cursor.name}
              width={32}
              height={32}
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <span className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">Default</span>
          )}
          <span className="text-xs mt-1">{cursor.name}</span>
        </button>
      ))}
    </div>
  );
} 