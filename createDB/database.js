const mongoose = require('mongoose')

const URL_DB = "mongodb://localhost:27017/carDB"


// create schema for user
let userSchema = mongoose.Schema({
    userName: String,
    email: String,
    password: String
})

// create schema for car
let carSchema = mongoose.Schema({
    carName: String,
    carModel: String,
    carColor: String,
    carPrice: Number
})

// create model for user and car
let User = mongoose.model('user', userSchema);
let Cars = mongoose.model('car', carSchema);

module.exports = {
    User: User,
    Cars: Cars
}