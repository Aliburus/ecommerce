import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useWishlist } from "../context/WishlistContext";

const API_URL = process.env.REACT_APP_API_URL;

function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/collections/${id}`);
        setCollection(res.data);
        if (res.data.products && res.data.products.length > 0) {
          const prodRes = await axios.get(`${API_URL}/api/products/all`, {
            withCredentials: true,
          });
          const filtered = prodRes.data.filter((p) =>
            res.data.products.includes(p._id)
          );
          setProducts(filtered);
        }
      } catch (err) {
        setError("Koleksiyon bulunamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  const handleWishlist = async (pid) => {
    if (wishlist.includes(pid)) {
      await removeFromWishlist(pid);
    } else {
      await addToWishlist(pid);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!collection) return null;

  return (
    <div className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-2xl font-bold mb-12 text-center text-black">
          {collection.name}
        </h1>
        {products.length === 0 ? (
          <div className="text-center text-gray-500">
            Bu koleksiyonda ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="group cursor-pointer   p-4  flex flex-col"
                onClick={() => navigate(`/urun/${product._id}`)}
                style={{ borderRadius: 0 }}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <img
                    src={
                      product.images && product.images[0]
                        ? typeof product.images[0] === "string"
                          ? product.images[0]
                          : `${API_URL}${product.images[0].url}`
                        : "/placeholder.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    className="absolute top-4 right-4 z-20 bg-white p-2 shadow-md hover:scale-110 transition-all duration-200 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(product._id);
                    }}
                  >
                    {wishlist.includes(product._id) ? (
                      <AiFillHeart className="h-6 w-6 text-red-600" />
                    ) : (
                      <AiOutlineHeart className="h-6 w-6 text-red-600" />
                    )}
                  </button>
                </div>
                <h3 className="text-m font-thin mb-1 text-center text-black line-clamp-2 min-h-[48px]">
                  {product.name}
                </h3>
                <p className="text-black text-center text-lg font-serif mb-2">
                  {product.price} ₺
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionDetail;
