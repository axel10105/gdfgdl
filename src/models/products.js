const mongoose=require('mongoose')
const product=mongoose.model("product",
    new mongoose.Schema({
            stripeId:{type:String,required:false},
            name:{type:String,required:true},
            description:String,
            prices:[
                {
                    stripePriceId:String,
                    currency:String,
                    amount:Number
                }
            ],
            createdAt:{type:Date,default:Date.now}
    })
)

module.exports=product