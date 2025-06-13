import React from "react";

const Notifications = () => {
  // Örnek bildirimler
  const notifications = [
    { id: 1, text: "Siparişiniz kargoya verildi.", date: "2024-06-12" },
    { id: 2, text: "Yeni kampanya başladı!", date: "2024-06-10" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Bildirimler</h3>
      <ul className="space-y-4">
        {notifications.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <div className="font-semibold">{n.text}</div>
              <div className="text-gray-500 text-sm">{n.date}</div>
            </div>
            <button className="text-red-500 hover:underline">Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
