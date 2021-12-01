const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://testuser:1mfNIeRpAyP4njru@cluster0.2yxb6.mongodb.net/ChatApp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    name: String,
    filename: String,
});

var ImageData = mongoose.model('image', ImageSchema);

module.exports = ImageData;
