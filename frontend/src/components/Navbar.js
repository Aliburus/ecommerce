import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { FaUserShield } from "react-icons/fa";
import { getStoreInfo } from "../services/adminSettingsService";

function Navbar() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("Fashion");

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const settings = await getStoreInfo();
        if (settings.storeName) {
          setStoreName(settings.storeName);
        }
      } catch (error) {
        console.error("Mağaza ismi alınamadı:", error);
      }
    };
    fetchStoreName();
  }, []);

  const cartItemCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="relative w-full  z-50 bg-white border-b border-gray-100 py-4 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Sol: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-black">
              {storeName}
            </span>
          </Link>
        </div>
        {/* Orta: Menü */}
        <div className="hidden md:flex items-center gap-6 mx-auto">
          <Link
            to="/"
            className="text-sm text-gray-700 hover:text-black font-medium"
          >
            Anasayfa
          </Link>
          <Link
            to="/men"
            className="text-sm text-gray-700 hover:text-black font-medium"
          >
            Ürünler
          </Link>
          <Link
            to="/koleksiyonlar"
            className="text-sm text-gray-700 hover:text-black font-medium"
          >
            Koleksiyonlar
          </Link>

          <Link
            to="/about"
            className="text-sm text-gray-700 hover:text-black font-medium"
          >
            Hakkımızda
          </Link>
        </div>
        {/* Sağ: İkonlar */}
        <div className="flex items-center gap-5">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="h-5 w-5 text-gray-700" />
          </button>
          <Link
            to="/wishlist"
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <Heart className="h-5 w-5 text-gray-700" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/card"
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <ShoppingBag className="h-5 w-5 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          {!user ? (
            <>
              <Link
                to="/login"
                className="p-2 hover:bg-gray-100 rounded-full font-semibold"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="p-2 hover:bg-gray-100 rounded-full font-semibold"
              >
                Kaydol
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/users/profile"
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <User className="h-5 w-5 text-gray-700" />
              </Link>
              {user && user.isAdmin && (
                <button
                  className="p-2 hover:bg-gray-100 rounded-full ml-2"
                  title="Admin Panel"
                  onClick={() => navigate("/admin")}
                >
                  <FaUserShield className="h-5 w-5 text-blue-600" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
