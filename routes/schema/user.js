const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://testuser:1mfNIeRpAyP4njru@cluster0.2yxb6.mongodb.net/ChatApp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const SignUpSchema = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
});

var SignUpData = mongoose.model('user', SignUpSchema);

module.exports = SignUpData;
