require('dotenv').config()
const express = require('express')
const app = express()
require('./db/connection') //database 
const path = require('path')
const hbs = require('hbs') //view engine
const bcrypt = require('bcryptjs') //for password hashing
const Register = require('./models/employes') //models schema and collections
const cookieParser = require('cookie-parser') //for reading cookies
const auth = require('./middleware/auth')
port = process.env.PORT || 8000


const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const staticPath = path.join(__dirname, '../public')


app.use(express.static(staticPath))
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.json())
app.use(cookieParser()) //used to read saved cookies
app.use(express.urlencoded({extended:false}))


app.get("/", (req, res) => {
    res.render('index')
})
app.get("/secret", auth ,(req, res) => { //here we added a middleware 'auth' which is executed before the callback function
    // console.log(req.cookies.jwt) //this will print the data stored in cookie after login
    res.render('secret')
})
app.get('/logout', auth, async (req, res) => {
    try {
        res.clearCookie('jwt')
        console.log('logged out successfully')
        await req.user.save()
        res.render('login')
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get('/register', (req,res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        if(req.body.password === req.body.repeatPassword){
            const registerEmployee = new Register({
                email: req.body.email,
                password : req.body.password,
                repeatPassword: req.body.repeatPassword,
                firstName: req.body.firstName,
                lastName:req.body.lastName,
                phone: req.body.phone
            })

            const token = await registerEmployee.generateAuthToken() //generates an auth token this function is defined in models

            /*The res.cookie() function is used to set cookie name to a value. 
            The value parameter may be a string or object converted to JSON */

            //now we create a cookie for token
            res.cookie('jwt', token, {
                expires: new Date(Date.now() + 40000),
                httpOnly:true //client cannot delete this cookie now
            })
            const data = await registerEmployee.save()
            res.status(201).render('index')
        }else{
            res.send("passwords not matching")
        }
    } catch (error) {
        res.status(401).send("unknown error occured " + error)
    }
})

app.get('/login', (req , res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    try {
        const password = req.body.password
        const email = req.body.email
        const userData = await Register.findOne({email})
        const isMatch = await bcrypt.compare(password, userData.password)

//now we have to verify the auth token when user logs in
        const token = await userData.generateAuthToken()
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 400000),
            httpOnly:true, //client cannot delete this cookie now
            // secure:true     only used in https
        })

//if the password given matches to password stored already then it will render index page othewise gives error
        if(isMatch){
            res.status(201).render('index')
        }else{
            res.send("invalid login details")
        }
    } catch (error) {
        res.status(400).send("invalid login details")
    }
})
app.listen(port, (err) => {
    if(err)
        console.log(err + " \n\n\n error while connecting to the server")
    console.log("connected to port " + port)
});