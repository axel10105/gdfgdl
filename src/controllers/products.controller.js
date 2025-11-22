const { status } = require('express/lib/response')
const db=require('../models')
const SKSTRIPE=process.env.SKSTRIPE
const stripe=require('stripe')(SKSTRIPE)

const Product=db.product
const Cart=db.cart
const Order=db.order
const Coupon=db.coupon

exports.newproduct =async(req,res)=>{
try {
    const {name,description,price}=req.body

    const stripeProduct=await stripe.products.create({name,description}) 
    const stripePrice=await stripe.prices.create({
        product:stripeProduct.id,
        unit_amount:price*100,
        currency:'usd'
    }) 

    const product=new Product({
        name,
        description,
        stripeId: stripeProduct.id,
        prices:[{
            stripePriceId:stripePrice.id,
            currency:stripePrice.currency,
            amount:stripePrice.unit_amount

    }]  
    })
    await product.save()

    res.status(201).json({product})
} catch (error) {   
    res.status(401).send(error)
}
}

exports.viewproduct=async(req,res)=>{
try{const products=await db.product.find()
res.status(200).send(products)}
catch(error){
    res.status(500).send("error")
}
}

exports.addcart=async(req,res)=>{
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId; 

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });


    let cart = await Cart.findOne({ userId });


    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
    } else {
     
      const idx = cart.items.findIndex(item => item.productId == productId);

      if (idx > -1) {
   
        cart.items[idx].quantity += quantity;
      } else {
       
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    res.status(200).json({ message: "Añadido al carrito", cart });

  } catch (error) {
    res.status(500).json({ message: "Error añadiendo al carrito", error: error.message });
  }

}

exports.removeFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId; 

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Carrito vacío" });

    const idx = cart.items.findIndex(item => item.productId == productId);
    if (idx === -1) return res.status(404).json({ message: "Producto no está en el carrito" });


    cart.items[idx].quantity -= quantity;

   
    if (cart.items[idx].quantity <= 0) {
      cart.items.splice(idx, 1);
    }

    await cart.save();
    res.status(200).json({ message: "Producto actualizado en el carrito", cart });

  } catch (error) {
    res.status(500).json({ message: "Error modificando el carrito", error: error.message });
  }
};

exports.deleteproduct=async(req,res)=>{
    try {
    const Id=req.body.id

    const product=await Product.findById(Id)
    
    const priceId=product.prices?.[0]?.stripePriceId

await stripe.products.update(product.stripeId,{active:false})

await stripe.prices.update(priceId,{active:false})
   
     await Product.findByIdAndDelete(Id)

    res.status(201).send("producto elimnado")
} catch (error) {
    res.status(500).send(error)
}

}


exports.updtProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    const { name, description, prices } = req.body; 


    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    if (updateData.name || updateData.description) {
      await stripe.products.update(product.stripeId, updateData);
    }


    if (prices && Array.isArray(prices)) {
      for (const priceUpdate of prices) {

        const priceIndex = product.prices.findIndex(p => p.stripePriceId === priceUpdate.stripePriceId);
        if (priceIndex !== -1 && priceUpdate.amount) {

          const newStripePrice = await stripe.prices.create({
            product: product.stripeId,
            unit_amount: Math.round(priceUpdate.amount * 100),
            currency: product.prices[priceIndex].currency
          });


          product.prices[priceIndex] = {
            ...product.prices[priceIndex],
            stripePriceId: newStripePrice.id,
            amount: priceUpdate.amount
          };
        }
      }
    }

 
    if (Object.keys(updateData).length > 0 || (prices && prices.length)) {
      await product.save();
    }

    res.status(200).json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando producto", error: error.message });
  }
};


exports.createCheckout = async (req, res) => {
  try {
    const userId = req.userId;
    const couponCode = req.body.couponCode;

    // Traer carrito con populate
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Carrito vacío" });
    }

    // Filtrar productos válidos
    const validItems = cart.items.filter(
      item => item.productId && item.productId.prices.length > 0
    );
    if (validItems.length === 0) {
      return res.status(400).json({ message: "No hay productos válidos en el carrito" });
    }

    // Calcular total
    let total = validItems.reduce(
      (sum, item) => sum + item.productId.prices[0].amount * item.quantity,
      0
    );

    // Aplicar descuento si hay cupón
    let discount = 0;
    let stripeCouponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) return res.status(400).json({ message: "Cupón inválido" });

      const now = new Date();
      if (coupon.expiresAt && coupon.expiresAt < now) {
        return res.status(400).json({ message: "Cupón expirado" });
      }

      if (coupon.discountPercentage) {
        discount = (total * coupon.discountPercentage) / 100;
        total -= discount;
      }

      if (total < 0) total = 0;

      stripeCouponId = coupon.stripeId; // si creaste el cupón en Stripe y guardaste su ID
    }

    // Crear line_items para Stripe
    const line_items = validItems.map(item => ({
      price: item.productId.prices[0].stripePriceId,
      quantity: item.quantity
    }));

    // Crear sesión Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [],
      success_url: `http://localhost:5000/api/product/voucher?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/api/product/cancel`
    });

    // Guardar orden en DB
    await Order.create({
      userId,
      items: validItems,
      total,
      stripeSessionId: session.id,
      status: 'pending'
    });

    res.status(200).json({
      message: "Pago iniciado",
      sessionId: session.id,
      url: session.url,
      total,
      discount
    });

  } catch (error) {
    console.error("Error en createCheckout:", error);
    res.status(500).json({ message: "Error al crear el pago", error: error.message });
  }
};
exports.getVoucher = async (req, res) => {
  try {
    const sessionId = req.query.session_id

    if (!sessionId) {
      return res.status(400).json({ message: "Falta session_id" });
    }
   
    const order = await Order.findOne({ stripeSessionId: sessionId }).populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    
    if (order.status !== 'paid') {
      order.status = 'paid';
      await order.save();
    }

    await Cart.findOneAndDelete({ userId: order.userId });

    res.status(200).json({
      message: "Este es tu comprobante",
      order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el comprobante" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, maxUses, expiresAt } = req.body;

    if (!code || !discountPercentage) {
      return res.status(400).json({ message: "Faltan datos del cupón" });
    }

    await stripe.coupons.create({
      id: code,
      percent_off: discountPercentage,
      duration: "once" 
    });

    const newCoupon = new Coupon({
      code,
      discountPercentage,
      maxUses: maxUses || 1,
      expiresAt: expiresAt || null
    });

    await newCoupon.save();

    res.status(201).json({ message: "Cupón creado", coupon: newCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};