import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Card from "./pages/Card";
import Admin from "./pages/admin/Admin";

import Men from "./pages/Men";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import CollectionDetail from "./pages/CollectionDetail";
import ProductDetail from "./pages/ProductDetail";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import OrderDetail from "./components/admin/OrderDetail";
import { Toaster } from "react-hot-toast";
import CustomerDetail from "./components/admin/CustomerDetail";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user && location.pathname !== "/login") {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return children;
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            width: "100%",
            maxWidth: "100%",
            borderRadius: "0",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
        }}
      />
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow min-h-screen">
                  <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/about" element={<About />} />

                    <Route path="/men" element={<Men />} />

                    <Route path="/koleksiyonlar" element={<Collections />} />
                    <Route
                      path="/koleksiyonlar/:id"
                      element={<CollectionDetail />}
                    />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/urun/:id" element={<ProductDetail />} />
                    <Route
                      path="/wishlist"
                      element={
                        <PrivateRoute>
                          <Wishlist />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/card"
                      element={
                        <PrivateRoute>
                          <Card />
                        </PrivateRoute>
                      }
                    />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/orders/:id" element={<OrderDetail />} />
                    <Route
                      path="/admin/customers/:id"
                      element={<CustomerDetail />}
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </>
  );
}

export default App;
