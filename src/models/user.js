const moongose=require('mongoose')

const user=moongose.model(
    "user",
    new moongose.Schema({
        username:String,
        email:String,
        password:String,
        roles:[
           {
             type:moongose.Schema.Types.ObjectId,
             ref:"role"

           }
        ]
    })
)

module.exports=user