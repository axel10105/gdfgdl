const mongoose=require('mongoose')

const order = mongoose.model("order",new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      quantity: Number,
    }
  ],
  total: Number,
  stripeSessionId: String, // solo referencia
  status: { type: String, default: "paid" }, // paid, refunded, canceled
  createdAt: { type: Date, default: Date.now }
}))

module.exports=order