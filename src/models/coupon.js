const mongoose=require('mongoose')

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true }, // ej: 20 para 20%
  maxUses: { type: Number, default: 1 }, // cuántas veces se puede usar
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
});

module.exports = mongoose.model("Coupon", couponSchema);