// verifier les roles(admin ou chauffeur)
const authorize = (role)=>{
    return (req,res,next)=>{
        if(!role.include(req.user.role)){
            res.status('403').json({ message: "Accès refusé : vous n'avez pas la permission" })
        }
        next()
    }
}

module.exports = authorize