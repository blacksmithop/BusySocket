const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://testuser:1mfNIeRpAyP4njru@cluster0.2yxb6.mongodb.net/ChatApp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    body: String, // Message or image url
    from: String, // Username (sender)
    to: String, // Username (receiver)
    // system: boolean, false by default
    time: Date,
    type: String,
    user: {
        username: String,
        firstname: String,
        lastname: String
    }
});

var MessageData = mongoose.model('history', MessageSchema);

module.exports = MessageData;


