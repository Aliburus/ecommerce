import React from "react";

const Payments = () => {
  // Örnek kart verisi
  const cards = [
    { id: 1, name: "Ali Yılmaz", number: "**** **** **** 1234", type: "Visa" },
    {
      id: 2,
      name: "Ali Yılmaz",
      number: "**** **** **** 5678",
      type: "MasterCard",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Ödeme Yöntemlerim</h3>
      <ul className="space-y-4">
        {cards.map((card) => (
          <li
            key={card.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <div className="font-semibold">{card.name}</div>
              <div className="text-gray-500 text-sm">
                {card.number} - {card.type}
              </div>
            </div>
            <button className="text-red-500 hover:underline">Sil</button>
          </li>
        ))}
      </ul>
      <button className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
        Yeni Kart Ekle
      </button>
    </div>
  );
};

export default Payments;
