const {verifySignUp}=require('../middlewares')
const controller=require('../controllers/auth.controllers')

module.exports=function(app){
    app.use((req,res,next)=>{
       res.header(
        "Access-Control-Allow-Headers",
        "Origin,Content-Type,Acept"
       )
       next()
    })   
  app.post("/api/auth/signup",[verifySignUp.checkDuplicateUsernameOrEmail,verifySignUp.checkRoleExisted],controller.signup)
    app.post("/api/auth/signout", controller.signout);
    app.post("/api/auth/signin", controller.signin);

    
    
}