import React, { useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { FaCheck } from "react-icons/fa";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_MAP = {
  Siyah: "#000000",
  Beyaz: "#ffffff",
  Gri: "#808080",
  Mavi: "#2563eb",
  Kırmızı: "#dc2626",
};
const COLORS = Object.keys(COLOR_MAP);
const GENDERS = ["Kadın", "Erkek", "Unisex"];

function FilterBar({ filters, onFilterChange, onReset }) {
  const [open, setOpen] = useState({
    size: false,
    gender: false,
    price: false,
    color: false,
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-full md:w-64 bg-white p-4 border-r border-gray-200">
      {/* BEDEN */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full font-semibold text-sm uppercase mb-2 tracking-wide"
          onClick={() => toggle("size")}
        >
          BEDEN
          {open.size ? (
            <IoIosArrowUp size={18} />
          ) : (
            <IoIosArrowDown size={18} />
          )}
        </button>
        {open.size && (
          <div className="flex flex-wrap gap-1">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => {
                  const newSizes = filters.sizes.includes(size)
                    ? filters.sizes.filter((s) => s !== size)
                    : [...filters.sizes, size];
                  onFilterChange("sizes", newSizes);
                }}
                className={`px-2 py-1 border text-xs font-normal rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 ${
                  filters.sizes.includes(size)
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-black hover:bg-gray-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CİNSİYET */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full font-semibold text-sm uppercase mb-2 tracking-wide"
          onClick={() => toggle("gender")}
        >
          CİNSİYET
          {open.gender ? (
            <IoIosArrowUp size={18} />
          ) : (
            <IoIosArrowDown size={18} />
          )}
        </button>
        {open.gender && (
          <div className="flex flex-wrap gap-1">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                onClick={() => {
                  onFilterChange(
                    "gender",
                    gender === filters.gender ? "" : gender
                  );
                }}
                className={`px-2 py-1 border text-xs font-normal rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 ${
                  filters.gender === gender
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-black hover:bg-gray-100"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FİYAT */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full font-semibold text-sm uppercase mb-2 tracking-wide"
          onClick={() => toggle("price")}
        >
          FİYAT
          {open.price ? (
            <IoIosArrowUp size={18} />
          ) : (
            <IoIosArrowDown size={18} />
          )}
        </button>
        {open.price && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              value={filters.priceRange[0]}
              onChange={(e) => {
                let val = e.target.value.replace(/^0+(?!$)/, "");
                if (val === "") val = 0;
                onFilterChange("priceRange", [
                  Number(val),
                  filters.priceRange[1],
                ]);
              }}
              className="w-16 px-2 py-1 border border-black rounded text-xs focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Min"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="number"
              min={0}
              value={filters.priceRange[1]}
              onChange={(e) => {
                let val = e.target.value.replace(/^0+(?!$)/, "");
                if (val === "") val = 0;
                onFilterChange("priceRange", [
                  filters.priceRange[0],
                  Number(val),
                ]);
              }}
              className="w-16 px-2 py-1 border border-black rounded text-xs focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Max"
            />
          </div>
        )}
      </div>

      {/* RENK */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full font-semibold text-sm uppercase mb-2 tracking-wide"
          onClick={() => toggle("color")}
        >
          RENK
          {open.color ? (
            <IoIosArrowUp size={18} />
          ) : (
            <IoIosArrowDown size={18} />
          )}
        </button>
        {open.color && (
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <div key={color} className="flex flex-col items-center">
                <button
                  onClick={() => {
                    const newColors = filters.colors.includes(color)
                      ? filters.colors.filter((c) => c !== color)
                      : [...filters.colors, color];
                    onFilterChange("colors", newColors);
                  }}
                  className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20
                    ${
                      filters.colors.includes(color)
                        ? "border-black scale-110"
                        : "border-gray-200 hover:scale-105 hover:shadow-lg"
                    }
                  `}
                  style={{ backgroundColor: COLOR_MAP[color] }}
                  aria-label={color}
                >
                  {filters.colors.includes(color) && (
                    <FaCheck
                      className={`absolute text-xs ${
                        color === "Beyaz" ? "text-black" : "text-white"
                      }`}
                    />
                  )}
                </button>
                <span className="mt-1 text-[10px] text-gray-600 select-none">
                  {color}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtreleri Sıfırla */}
      <button
        onClick={onReset}
        className="py-2 px-4 w-full text-xs font-medium border border-black rounded hover:bg-gray-200 transition-colors duration-200"
      >
        Filtreleri Sıfırla
      </button>
    </aside>
  );
}

export default FilterBar;
