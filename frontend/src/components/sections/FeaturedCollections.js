import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FeaturedCollections() {
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/collections`
        );
        setCollections(res.data.slice(0, 3)); // Sadece ilk 3 koleksiyon
      } catch {
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Öne Çıkan Koleksiyonlar</h2>
          <a href="/koleksiyonlar" className="text-gray-600 hover:text-black">
            Tümünü Gör →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col) => (
            <div
              key={col._id}
              className="relative group cursor-pointer overflow-hidden h-[500px] flex flex-col justify-end"
              onClick={() => navigate(`/koleksiyonlar/${col._id}`)}
            >
              <img
                src={col.image || "/placeholder.jpg"}
                alt={col.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 z-0"
              />
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-end h-full p-10 text-center pb-12">
                <h3 className="text-white text-2xl font-semibold mb-2 tracking-widest uppercase">
                  {col.name}
                </h3>
                <p className="text-white/90 text-base mb-6 max-w-xs">
                  {col.description}
                </p>
                <button
                  className="mt-2 px-6 py-2 bg-white text-black rounded-none tracking-widest text-base font-light border-0 hover:bg-gray-200 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/koleksiyonlar/${col._id}`);
                  }}
                >
                  BROWSE COLLECTION
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedCollections;
