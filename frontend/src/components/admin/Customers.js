import React, { useState, useMemo } from "react";
import { Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Customers({ users, orders }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const usersPerPage = 10;

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(s)) ||
        (u.surname && u.surname.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s))
    );
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const pagedUsers = filteredUsers.slice(
    page * usersPerPage,
    (page + 1) * usersPerPage
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Müşteriler</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim veya Email ile ara..."
              className="px-4 py-2 border rounded-lg pl-10"
            />
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5" />
            <span>Dışa Aktar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4">Müşteri</th>
              <th className="pb-4">E-posta</th>
              <th className="pb-4">Kayıt Tarihi</th>
              <th className="pb-4">Toplam Sipariş</th>
              <th className="pb-4">Toplam Harcama</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((user) => {
              const userOrders = orders.filter(
                (o) =>
                  o.user && (o.user._id === user._id || o.user === user._id)
              );
              const totalSpent = userOrders.reduce(
                (sum, o) => sum + (o.totalAmount || 0),
                0
              );
              return (
                <tr
                  key={user._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/admin/customers/${user._id}`)}
                >
                  <td className="py-4">
                    {user.name} {user.surname}
                  </td>
                  <td className="py-4">{user.email}</td>
                  <td className="py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">{userOrders.length}</td>
                  <td className="py-4">
                    ₺{totalSpent.toLocaleString("tr-TR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <tfoot>
            <tr>
              <td colSpan="5">
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={`w-8 h-8 rounded-full border text-sm font-medium ${
                        page === idx
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </div>
    </div>
  );
}

export default Customers;
