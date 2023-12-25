const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const employeeSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error("Not a valid email")
        },
        unique:true
    },
    password : {
        type:String,
        required:true,
        // minlength: 8
    },
    repeatPassword: {
        type: String,
        required: true,
        trim: true,
        // minlength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    lastName:{
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    phone: {
        type: String,
        required: true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})
//using middlewares
/*Statics are methods defined on models
    methods are defined on document (instance)
    use .statics for static methods
    use .methods for instance methods
*/

//middelware for generating auth tokens
employeeSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id: this._id}, "thisisasecretkeyusedasanexamplefortokenauthenticationshouldbeminimum32characterslong")
        this.tokens = this.tokens.concat({token:token}) //when key and value both are same we can only write one of them e.g; {token}
        await this.save() //save to database
        return token
    } catch (error) {
        console.log("error occured while generating token " + error)
    }
}

//middleware for hashing of passwords
/*.pre is used for (before saving data to database) .post is used for (after saving data to database) */
employeeSchema.pre('save', async function(next){ //dont use fat arrow function here
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 4) //here we use 4 roounds of hashing we can use at max 12 rounds but the more the rounds the more time it takes to hash
        this.repeatPassword = await bcrypt.hash(this.password, 4)
    }
    next() //most important , it will run the next part of code that comes after it
})

// creating a mongoose.Collection
const Register = new mongoose.model('Register', employeeSchema)
module.exports = Register