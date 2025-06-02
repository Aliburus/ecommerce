import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import LoadingSpinner from "../components/LoadingSpinner";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/wishlist`,
          { withCredentials: true }
        );
        setWishlist(res.data);
      } catch {
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/wishlist/remove`,
        { productId },
        { withCredentials: true }
      );
      setWishlist((prev) =>
        prev.filter((item) => item.product._id !== productId)
      );
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">Favorilerim</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.length === 0 ? (
            <div>Favori ürününüz yok.</div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.product._id}
                className="group cursor-pointer"
                onClick={() => navigate(`/urun/${item.product._id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={
                      item.product.images[0]?.url
                        ? `${process.env.REACT_APP_API_URL}${item.product.images[0].url}`
                        : "/placeholder.jpg"
                    }
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    className="absolute top-4 right-4 z-20 bg-white rounded-full p-1 shadow hover:scale-110 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.product._id);
                    }}
                  >
                    <AiFillHeart className="h-7 w-7 text-red-600" />
                  </button>
                </div>
                <h3 className="text-m mb-1 font-thin text-center">
                  {item.product.name}
                </h3>
                <p className="text-black text-center text-lg font-serif mb-2">
                  {item.product.price} ₺
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
