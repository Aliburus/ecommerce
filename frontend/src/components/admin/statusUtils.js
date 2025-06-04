// Sipariş durumunu Türkçe'ye çevirir
export function statusToText(status) {
  switch (status) {
    case "pending":
      return "Beklemede";
    case "processing":
      return "Siparişiniz Hazırlanıyor";
    case "shipped":
      return "Kargoda";
    case "delivered":
      return "Teslim Edildi";
    case "cancelled":
      return "İptal Edildi";
    default:
      return status;
  }
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
