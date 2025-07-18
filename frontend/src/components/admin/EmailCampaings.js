import React, { useState, useEffect } from "react";
import {
  createCampaign,
  getCampaigns,
  sendCampaign,
} from "../../services/emailCampaignService";
import { toast } from "react-hot-toast";
import { Mail } from "lucide-react";

const EmailCampaings = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    recipientType: "all",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error("Kampanyalar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCampaign(formData);
      toast.success("Kampanya oluşturuldu");
      setFormData({
        name: "",
        subject: "",
        content: "",
        recipientType: "all",
      });
      fetchCampaigns();
    } catch (error) {
      toast.error("Kampanya oluşturulurken hata oluştu");
    }
  };

  const handleSend = async (id) => {
    try {
      await sendCampaign(id);
      toast.success("Kampanya gönderimi başlatıldı");
      fetchCampaigns();
    } catch (error) {
      toast.error("Kampanya gönderilirken hata oluştu");
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-8">Toplu E-Posta Gönderimi</h1>
      </div>

      {/* Kampanya Oluşturma Formu */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Yeni Kampanya Oluştur</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kampanya Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Konu
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                İçerik
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows="6"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Kişiselleştirme için {`{{ name }}`} kullanabilirsiniz
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Alıcılar
              </label>
              <select
                value={formData.recipientType}
                onChange={(e) =>
                  setFormData({ ...formData, recipientType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                <option value="all">Tüm Kullanıcılar</option>
                <option value="active">Aktif Kullanıcılar (Son 30 gün)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Kampanya Oluştur
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Kampanya Listesi */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Kampanyalar</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kampanya
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gönderilen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başarısız
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {campaign.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "sending"
                          ? "bg-yellow-100 text-yellow-800"
                          : campaign.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.sentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.failedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {campaign.status === "draft" && (
                      <button
                        onClick={() => handleSend(campaign._id)}
                        className="text-black hover:text-gray-800"
                      >
                        Gönder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaings;
