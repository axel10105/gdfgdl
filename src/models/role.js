const moongose=require('mongoose')
const role=moongose.model(
      "role",
      new moongose.Schema({
        name:String
      })
)
module.exports=role