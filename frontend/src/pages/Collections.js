import React, { useEffect, useState } from "react";
import { getCollections } from "../services/collectionService";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getCollections();
        setCollections(data);
      } catch (err) {
        setError("Koleksiyonlar alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12 text-center">
          Koleksiyonlarımız
        </h1>
        {collections.length === 0 ? (
          <div className="text-center text-gray-500">Koleksiyon bulunamadı</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {collections.map((collection) => (
              <div key={collection._id} className="group">
                <div className="relative w-full aspect-[16/7] h-[calc(100vh-72px)] max-h-[500px] overflow-hidden mb-8 rounded-none">
                  {collection.image && (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white max-w-2xl px-6">
                      <h2 className="text-4xl font-bold mb-4">
                        {collection.name}
                      </h2>
                      <p className="text-xl mb-8">{collection.description}</p>
                      <button
                        className="bg-white text-black px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          navigate(`/koleksiyonlar/${collection._id}`)
                        }
                      >
                        Koleksiyonu Keşfet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Collections;
