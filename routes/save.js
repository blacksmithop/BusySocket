
const router = require('express').Router();

// Multer: set dest + config here
const multer = require('multer')

// Image schema
const Image = require('./schema/image');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + '.jpg')
    }
});

var upload = multer({ storage: storage });

router.post('/upload', upload.single('image_upload'), (req, res) => {
    data = {
        'name': req.file.originalname,
        'filename': req.file.filename,
    }
    console.log(data);
    console.log("File: ", req.file.originalname);
    addImage = new Image(data);
    addImage.save().then(function (data) {
        return res.status(200).send(
            {
                message: 'File uploaded successfully',
                filename: req.file.filename,
                id: data._id,
                url: `http://localhost:3000/static/${req.file.filename}`
            });


    });
});

router.get('/getImage/:id', (req, res) => {
    Image.findOne({ "_id": req.param('id') })
        .then((image) => {
            res.status(200).send({
                message: "Image",
                data: image
            });
        });

});


module.exports = router;
