const {authJwt}=require('../middlewares')
const controller=require('../controllers/products.controller')

module.exports=function (app){
    app.use((req,res,next)=>{
        res.header(
             "Access-Control-Allow-Headers",
             "Origin,Content-Type,Accept"
        )   
      next()
    })
    app.post('/api/product/new',[authJwt.verifyToken,authJwt.isAdmin],controller.newproduct)
    app.get('/api/prodcut/view',controller.viewproduct)
    app.delete('/api/product/delete',[authJwt.verifyToken,authJwt.isAdmin],controller.deleteproduct)
    app.put('/api/product/chng/:id',[authJwt.verifyToken,authJwt.isModerator],controller.updtProduct)
    app.post('/api/product/addtocart',[authJwt.verifyToken],controller.addcart)
    app.post('/api/product/cartremove',[authJwt.verifyToken],controller.removeFromCart)
    app.post('/api/product/payy',[authJwt.verifyToken],controller.createCheckout)
    app.get('/api/product/voucher',controller.getVoucher)
    app.post('/api/product/cratecoupon',[authJwt.verifyToken,authJwt.isModerator],controller.createCoupon)
}