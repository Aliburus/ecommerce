const Address = require("../models/addressModel");
const asyncHandler = require("express-async-handler");

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.json(addresses);
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const {
    title,
    fullName,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    isDefault,
  } = req.body;

  // If this is the first address or isDefault is true, set all other addresses to non-default
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const newAddress = new Address({
    user: req.user._id,
    title,
    fullName,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    isDefault: isDefault || false,
  });

  const savedAddress = await newAddress.save();
  res.status(201).json(savedAddress);
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const {
    title,
    fullName,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    isDefault,
  } = req.body;

  const addressToUpdate = await Address.findById(req.params.id);

  if (!addressToUpdate) {
    res.status(404);
    throw new Error("Adres bulunamadı");
  }

  // Check if the address belongs to the user
  if (addressToUpdate.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bu adresi güncelleme yetkiniz yok");
  }

  // If setting as default, update other addresses
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  addressToUpdate.title = title || addressToUpdate.title;
  addressToUpdate.fullName = fullName || addressToUpdate.fullName;
  addressToUpdate.phone = phone || addressToUpdate.phone;
  addressToUpdate.address = address || addressToUpdate.address;
  addressToUpdate.city = city || addressToUpdate.city;
  addressToUpdate.state = state || addressToUpdate.state;
  addressToUpdate.country = country || addressToUpdate.country;
  addressToUpdate.zipCode = zipCode || addressToUpdate.zipCode;
  addressToUpdate.isDefault =
    isDefault !== undefined ? isDefault : addressToUpdate.isDefault;

  const updatedAddress = await addressToUpdate.save();
  res.json(updatedAddress);
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Adres bulunamadı");
  }

  // Check if the address belongs to the user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bu adresi silme yetkiniz yok");
  }

  await address.deleteOne();
  res.json({ message: "Adres silindi" });
});

// @desc    Set address as default
// @route   PUT /api/addresses/:id/set-default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Adres bulunamadı");
  }

  // Check if the address belongs to the user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bu adresi varsayılan yapma yetkiniz yok");
  }

  // Set all addresses to non-default
  await Address.updateMany({ user: req.user._id }, { isDefault: false });

  // Set this address as default
  address.isDefault = true;
  await address.save();

  res.json(address);
});

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
