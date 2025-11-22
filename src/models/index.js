const mongoose=require('mongoose')
mongoose.Promise=global.Promise

const db={}

db.mongoose=mongoose

db.user=require('./user')
db.role=require('./role')
db.product=require('./products')
db.cart=require('./cart')
db.order=require('./order')
db.coupon=require('./coupon')


db.ROLES=['admin','moderator','user']

db.init=()=>{
    db.role.estimatedDocumentCount((err,count)=>{
       if(!err&count===0){
         new db.role({
            name:'user'
         }).save((error)=>{
            if(error){
                console.log("error al crear usuario")
            }
            console.log("usuario creado")
         })
        
         new db.role({
            name:'moderator'
         }).save((error)=>{
            if(error){
                console.log("eror al crear moderador")
            } 
               console.log("moderadr creado")
         })

         new db.role({
            name:'admin'
         }).save((error)=>{
            if(error){
                console.log("error al crear admin")
            }
             console.log("admin creado")
         }) 

        }

    })

}

module.exports=db