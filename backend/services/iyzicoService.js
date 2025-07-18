const Iyzipay = require("iyzipay");

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY,
  secretKey: process.env.IYZIPAY_SECRET_KEY,
  uri: process.env.IYZIPAY_BASE_URL,
});

async function makePayment({ amount, cardInfo, user, items }) {
  // Temel ödeme isteği örneği
  return new Promise((resolve) => {
    iyzipay.payment.create(
      {
        locale: Iyzipay.LOCALE.TR,
        conversationId: String(Date.now()),
        price: amount,
        paidPrice: amount,
        currency: Iyzipay.CURRENCY.TRY,
        installment: "1",
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        paymentCard: {
          cardHolderName: cardInfo.cardHolderName,
          cardNumber: cardInfo.cardNumber,
          expireMonth: cardInfo.expireMonth,
          expireYear: cardInfo.expireYear,
          cvc: cardInfo.cvc,
          registerCard: "0",
        },
        buyer: {
          id: user._id,
          name: user.name,
          surname: user.surname || "",
          gsmNumber: user.phone || "",
          email: user.email,
          identityNumber: "11111111111",
          registrationAddress: "Adres",
          ip: "85.34.78.112",
          city: "İstanbul",
          country: "Turkey",
        },
        shippingAddress: {
          contactName: user.name,
          city: "İstanbul",
          country: "Turkey",
          address: "Adres",
        },
        billingAddress: {
          contactName: user.name,
          city: "İstanbul",
          country: "Turkey",
          address: "Adres",
        },
        basketItems: items.map((item, i) => ({
          id: String(i + 1),
          name: "Ürün",
          category1: "Genel",
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: item.price,
        })),
      },
      (err, result) => {
        if (err || result.status !== "success") {
          resolve({
            success: false,
            message: result.errorMessage || "Ödeme hatası",
          });
        } else {
          resolve({ success: true, result });
        }
      }
    );
  });
}

module.exports = { makePayment };
