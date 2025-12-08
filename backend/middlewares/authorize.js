// verifier les roles(admin ou chauffeur)
const authorize = (role)=>{
    return (req,res,next)=>{
        if(!req.user || !req.user.role){
            return res.status(403).json({ message: "Accès refusé : utilisateur non authentifié" })
        }
        if(req.user.role !== role){
            return res.status(403).json({ message:`Le rôle ${req.user.role} n'a pas accès à cette ressource` })
        }
        next()
    }
}

module.exports = authorize