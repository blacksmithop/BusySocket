const router = require('express').Router();
const bodyParser = require('body-parser');

// User schema
const User = require('./schema/user');

// Hash
const bcrypt = require('bcrypt');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Login
router.post('/login', function (req, res) {
    var data = {
        username: req.body.username,
        password: req.body.password,
    };

    User.findOne({ "username": req.body.username })
        .then((user) => {
            if (user) {
                bcrypt.compare(req.body.password, user.password, function (err, result) {
                    if (result) {
                        data = {
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        }
                        res.status(200).send({
                            message: "Login success",
                            data: data
                        })
                    } else {
                        res.status(409).send({
                            message: "Password incorrect"
                        })
                    }
                });
            }
            else {
                res.status(409).send({
                    message: "User not found"
                })
            }
        });

});

// Signup
router.post('/signup', function (req, res) {
    var data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
    };
    // Password hash
    if (req.body.password) {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            data['password'] = hash;
        });
    }

    User.findOne({ "username": req.body.username })
        .then((user) => {
            if (user) {
                res.status(409).send({
                    message: 'Account with username already exists'
                });
            }
            else {
                console.log(`Adding ${req.body.username} to the DB`);

                addUser = new User(data);
                addUser.save().then(function (data) {
                    res.status(200).send({
                        message: "Added user to DB"
                    })

                });
            }
        });

});

// Check if username unique
router.get('/unique/username/:uname', (req, res) => {

    User.findOne({ "username": req.params.uname })
        .then((user) => {
            if (user) {
                console.log(`Username ${req.params.uname} found in DB`);
                res.status(409).send({
                    message: 'Account with username already exists'
                });
            }
            else {
                res.status(200).send({
                    message: 'OK'
                });
            }
        });
});


module.exports = router;