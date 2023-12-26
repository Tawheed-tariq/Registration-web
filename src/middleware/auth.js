const jwt = require('jsonwebtoken')
const Register = require('../models/employes')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY)
        const user = await Register.findOne({_id:verifyToken._id})
        req.token = token
        req.user = user
        next() //calls the next function or statement 
    } catch (error) {
        res.status(401).send(error) //gives error if token not verified
    }
}

module.exports = auth