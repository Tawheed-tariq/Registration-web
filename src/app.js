const express = require('express')
const app = express()
require('./db/connection') 
const path = require('path')
const hbs = require('hbs')
const bcrypt = require('bcryptjs')
const Register = require('./models/employes')
port = process.env.PORT || 8000

const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
const staticPath = path.join(__dirname, '../public')


app.use(express.static(staticPath))
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.json())
app.use(express.urlencoded({extended:false}))


app.get("/", (req, res) => {
    res.render('index')
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