import React from "react";

const Favorites = () => {
  // Örnek favori ürünler
  const favorites = [
    { id: 1, name: "Nike Air Max", price: "2.500 TL" },
    { id: 2, name: "Adidas Superstar", price: "1.800 TL" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Favorilerim</h3>
      <ul className="space-y-4">
        {favorites.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-gray-500 text-sm">{item.price}</div>
            </div>
            <button className="text-red-500 hover:underline">Kaldır</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
