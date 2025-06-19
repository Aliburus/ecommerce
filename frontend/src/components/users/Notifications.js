import React, { useEffect, useState } from "react";
import { getUserCampaigns } from "../../services/emailCampaignService";
import LoadingSpinner from "../LoadingSpinner";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const campaigns = await getUserCampaigns();
        const campaignNotifications = campaigns.map((c) => ({
          id: `campaign-${c._id}`,
          text: c.subject,
          date: c.createdAt ? c.createdAt.slice(0, 10) : "",
        }));
        setNotifications(campaignNotifications);
      } catch (e) {}
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Bildirimler</h3>
      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Bildirim yok.</div>
      ) : (
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
      )}
    </div>
  );
};

export default Notifications;
