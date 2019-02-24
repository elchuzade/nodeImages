let express         = require('express'),
    multer          = require('multer'),
    path            = require('path'),
    fs              = require('fs'),
    mongoose        = require('mongoose'),
    bodyParser      = require('body-parser');

let ImageData       = require('./models/imageData');

// init app
let app = express();
mongoose.connect('mongodb://localhost/imgimg');
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

app.get('/images/:image_id', (req, res) => {
  ImageData.findById(req.params.image_id, (err, foundImage) => {
    if (err) { console.log(err) } else {
      console.log('---',foundImage);
      res.render('image', { image: foundImage });
    }
  });
});

// delete route
app.post('/images/:image_id/delete', (req, res) => {
  ImageData.findById(req.params.image_id, (err, foundImage) => {
    if (err) { console.log(err) } else {
      fs.unlinkSync(`./public/uploads/${foundImage.fileName}`);
      ImageData.findByIdAndRemove(req.params.image_id, (err) => {
        if(err) { console.log(err) } else {
          res.redirect('/');
        }
      });
    }
  });
});

app.get('/upload', (req, res) => {
  res.render('upload');
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
      let newImage = {
        fieldName:      req.file.fieldname,
        originalName:   req.file.originalname,
        encoding:       req.file.encoding,
        mimeType:       req.file.mimetype,
        destination:    req.file.destination,
        fileName:       req.file.filename,
        path:           req.file.path,
        size:           req.file.size
      };
      if (req.file == undefined) {
        res.render('upload', { msg: 'Error: no file selected' });
      } else {
        ImageData.create(newImage, (err, createdImage) => {
          if(err) { console.log(err) } else {
            res.redirect('/');
          }
        });
      }
    }
  });
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log('Server started');
});