const express = require('express')
const mongoose = require('mongoose')
const db = require('../createDB/database')
const path = require('path')
const bodyParser = require('body-parser')
const router = express.Router();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const fs = require('fs')
const alert = require('alert')
const URL_DB = "mongodb://localhost:27017/carDB"


const bodyParserMW = bodyParser.urlencoded({ extended: true })

router.use(cookieParser()) // use middelware for cookieParser


var id_user = "";
// Router-level middleware
router.post('/register', bodyParserMW, (req, res, next) => {

    mongoose.connect(URL_DB, (err) => {
        let newUser = new db.User({
            userName: req.body.register_userName,
            email: req.body.register_email,
            password: req.body.register_password
        })

        newUser.save((err, result) => {
            console.log('User Is Registered')
            id_user = result._id.toString();
            res.redirect('/setcookie')
            mongoose.disconnect()
        })
    })

})


router.get('/home', (req, res) => {

    mongoose.connect(URL_DB, (err) => {
        var name_profile = "";

        db.User.findById({ _id: req.cookies.id_user }, (err, user) => {
            name_profile = user.userName;
        })

        db.Cars.find((err, cars) => {
            res.render('home', { cars: cars, name_profile: name_profile });
            mongoose.disconnect();
        })
    })
})


router.get('/setcookie', (req, res) => {
    res.cookie("id_user", id_user)
    res.redirect('/home')
})



let secret = fs.readFileSync('./secret.key');
router.post('/login', bodyParserMW, (req, res, next) => {
    let user_token = {
        name: req.body.login_userName,
        password: req.body.login_password
    }
    let token = jwt.sign(user_token, secret);


    // decode token
    let userNameToken = "", passwordToken = "";
    if (token) {
        jwt.verify(token, secret, function (err, token_data) {
            if (err) {
                res.status(403);
                alert("Error")
            } else {
                userNameToken = token_data.name;
                passwordToken = token_data.password;
            }
        });

    } else {
        res.status(403).send('No token');
    }

    mongoose.connect(URL_DB, (err) => {
        db.User.findOne({ userName: userNameToken }).select(['_id', 'password']).lean().then(result => {
            if (result) {
                // user exists...
                if (passwordToken === result.password) {
                    res.cookie("id_user", result._id.toString())
                    res.redirect('/home')
                } else {
                    alert("The Password Incorrect");
                    res.redirect('/login')
                }
            } else {
                // user not exists...
                alert("The User Name Incorrect");
                res.redirect('/login')
            }
            mongoose.disconnect()
        });
    })
})



router.post('/home/insert', bodyParserMW, (req, res) => {
    mongoose.connect(URL_DB, (err) => {
        let newCar = new db.Cars({
            carName: req.body.name,
            carModel: req.body.model,
            carColor: req.body.color,
            carPrice: req.body.price
        })

        newCar.save((err, result) => {
            console.log("Car Inserted")
            mongoose.disconnect()
            res.redirect('/home')
        })
    })
})



router.post('/home/update', bodyParserMW, (req, res) => {
    mongoose.connect(URL_DB, (err) => {
        db.Cars.findOne({ carName: req.body.name }).select("_id")
            .lean().then(result => {
                if (result) {
                    // car exists...
                    let carUpdate = {
                        carName: req.body.name,
                        carModel: req.body.model,
                        carColor: req.body.color,
                        carPrice: req.body.price
                    }
                    db.Cars.updateOne({ _id: result._id }, carUpdate, (err, result) => {
                        console.log("Car is Updated")
                        mongoose.disconnect()
                        res.redirect('/home')
                    })

                } else {
                    // car not exists...
                    alert("The Car Not Found")
                }
            });
    })

})


router.post('/home/delete', bodyParserMW, (req, res) => {
    mongoose.connect(URL_DB, (err) => {
        db.Cars.findOne({ carName: req.body.name }).select("_id")
            .lean().then(result => {
                if (result) {
                    // Car exists...
                    db.Cars.deleteOne({ _id: result._id }, (err, result) => {
                        console.log("Car is Deleted")
                        mongoose.disconnect()
                        res.redirect('/home')
                    })
                } else {
                    // car not exists...
                    alert("The Car Not Found")
                }
            });
    })
})


router.post('/home/Search', bodyParserMW, (req, res) => {
    mongoose.connect(URL_DB, (err) => {
        db.Cars.findOne({ carName: req.body.name }).select("_id")
            .lean().then(result => {
                if (result) {
                    // Car exists...
                    alert('Car Found')
                    res.redirect('/home')
                } else {
                    // car not exists...
                    alert("The Car Not Found")
                }
            });
    })
})



module.exports = router;