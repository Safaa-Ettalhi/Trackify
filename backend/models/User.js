const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name:{
    type:string ,
    required:[true,'Le nom est requis'],
    trim:true,
   },
   email: {
    type:string,
    required:[true,'L\'email est requis'],
    unique:true,
    lowercase:true,
    trim:true,
   },
   password: {
    type:string,
    required:[true,'Le mot de passe est requis'],
    minlength:[6,'Le mot de passe doit contenir au moins 6 caractères'],
    trim:true,
   },
   role:{
    type:string,
    enum:['admin','chauffeur'],
    default:'chauffeur',
   }
},
{
    timestamps:true,
}
)
//hashage de mdp avant le sauvegarde
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

//comparer le mdp avec le mdp hashé
userSchema.methods.comparePassword = async function(enteredPassword){
   return await bcrypt.compare(enteredPassword,this.password)
}



module.exports = mongoose.model('User',userSchema);