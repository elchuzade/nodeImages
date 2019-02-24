let express         = require('express'),
    multer          = require('multer'),
    path            = require('path'),
    fs              = require('fs'),
    mongoose        = require('mongoose'),
    bodyParser      = require('body-parser');

let ImageData       = require('./models/imageData');

// init app
let app = express();
mongoose.connect('mongodb://localhost/imageUpload');
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('./public'));

let storageVar = multer.diskStorage({
  destination: './public/uploads',
  filename: function(req, file, cb){
    // fieldname is myImage from input form name='myImage'
    // extname() means jpg, png, jpeg etc
    // originalname is the name the image had on your computer with extention
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// middleware function
function checkFileType(file, cb) {
  // allowed extensions
  let fileTypes = /jpeg|jpg|pdf|png|gif/;
  // check the extension
  let extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // check mimetype
  let mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb('Error: Images or PDF only');
  }
}

// .single() means 1 image will be uploaded, it can be .array() for multiple images
let upload = multer({
  storage: storageVar,
  // 2 MegaBytes limit for images
  limits: { fileSize: 2000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('myImage');

// show form route
app.get('/', (req, res) => {
  ImageData.find({}, (err, foundImages) => {
    if (err) { console.log(err) } else {
      res.render('index', { images: foundImages });
    }
  });
});

// delete route
app.get('/delete', (req, res) => {
  fs.unlinkSync('./public/uploads/myImage-1550999070268.pdf');
  res.send('deleted');
});

// edit route
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.render('upload', { msg: err });
    } else {
      // info from req.file should be added to the mongoDB
      console.log(req.file);
      if (req.file == undefined) {
        res.render('upload', { msg: 'Error: no file selected' });
      } else {
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log('Server started');
});