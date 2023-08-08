var express = require('express');
var app = express();
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var expressHbs = require('express-handlebars');
app.engine('.hbs', expressHbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('views/uploads'));
var items;
const multer = require('multer');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const secretKey = 'Trongdatlt2k3'
const quanao = require('./quanao');
const mongoose = require('mongoose');
const uri = 'mongodb+srv://trongdatlt:Trongdatlt2k3@cluster0.yokbnkg.mongodb.net/';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {

    var dir = './uploads';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {

    let fileName = file.originalname;
    arr = fileName.split('.');

    let newFileName = '';

    for (let i = 0; i < arr.length; i++) {
      if (i != arr.length - 1) {
        newFileName += arr[i];
      } else {
        newFileName += ('-' + Date.now() + '.' + arr[i]);
      }
    }

    cb(null, newFileName)
  }
})

var upload = multer({ storage: storage })




const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isPermission: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);


app.post('/register', async (req, res) => {
  const { email, password, name, address } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      return res.render('login', {
        layout: 'dangky',
        message: 'Email đã tồn tại'

      });
    }
    const newUser = new User({ email: email, password: password, name: name, address: address });
    await newUser.save();


    return res.render('login', {
      layout: 'dangky',
      message: 'Đã đăng ký thành công'

    });



  } catch (error) {
    console.error('Lỗi truy vấn MongoDB:', error);
    return res.render('login', {
      layout: 'dangky',
      message: 'Đã có lỗi xảy ra'

    });
  }
});



app.get('/protected', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Truy cập được vào route bảo vệ!',
  });
});
var token = "";

function verifyToken(req, res, next) {


  token = req.body.token || req.query.token || req.headers['authorization'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Chưa Đăng Nhập!',
    });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Đăng Nhập Không Hợp Lệ!',
      });
    }

    req.user = decoded;
    next();
  });
}



function checkAdmin(req, res, next) {
  console.log(req.user.isAdmin);
  if (req.user.isAdmin) {
    console.log(req.user.isAdmin);
    next();
  } else {

    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập'
    })
  }
}

function checkPermission(req, res, next) {
  console.log(req.user.isPermission);
  if (req.user.isPermission || req.user.isAdmin) {
    next();
  } else {

    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập'
    })
  }
}



app.get('/', async function (req, res) {
  try {
    // Đợi cho truy vấn hoàn tất và lấy kết quả
    const data = await quanao.find().lean();

    res.render('home', {
      layout: 'main',
      data: data,
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error parsing data');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email + password);
  try {
    // Tìm tài khoản trong cơ sở dữ liệu
    const user = await User.findOne({ email: email }).exec();
    console.log(user)
    if (!user || password !== user.password) {
      return res.render('login', {
        layout: 'dangnhap',
        message: 'Email hoặc mật khẩu không đúng'

      });
    }

    else {
      token = jwt.sign({ email: user.email, isPermission: user.isPermission, isAdmin: user.isAdmin }, secretKey, { expiresIn: '1h' });
      console.log("token:" + token);
      if (user.isPermission || user.isAdmin) {
        // Nếu là admin, điều hướng sang trang "/admin" và gửi mã token kèm theo
        return res.redirect(`/admin?token=${token}`);
      } else {
        // Nếu không phải admin, điều hướng sang trang "/" và gửi mã token kèm theo
        return res.redirect(`/?token=${token}`);
      }
    }



  } catch (error) {
    console.error('Lỗi truy vấn MongoDB:', error);
    return res.render('login', {
      layout: 'dangnhap',
      message: 'Đã có lỗi xảy ra'

    });
  }
});



app.get('/signin', function (req, res) {
  res.render('login', {
    layout: 'dangnhap',


  });
});


app.get('/signup', function (req, res) {
  res.render('login', {
    layout: 'dangky',
  });

});
app.get('/admin', verifyToken, checkPermission, async function (req, res) {


  try {
    const data = await quanao.find().lean();

    res.render('edit', {
      layout: 'setting1',
      data: data,
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error parsing data');
  }
});





app.get('/find/:id', async function (req, res) {
  const idFromURL = req.params.id;

  try {
    const product = await quanao.findOne({ id: idFromURL }).lean();
    res.render('find', {
      layout: 'find1',
      data: product,
      token: token

    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error parsing data');
  }



});






app.post('/add', upload.single('image'), async (req, res) => {

  const { id, name, price, total } = req.body;
  const picture = req.file.path;
  const product = await quanao.findOne({ id: id }).lean();
  if (product) {

  }
  else {
    const addquanao = new quanao({ id, name, picture, price, total });
    addquanao.save();

    console.log(addquanao);
    let listproduct = quanao.find().lean();

    return res.redirect(`/admin?token=${token}`);
  }


});



app.post('/addEmployee', upload.none(), async (req, res) => {
  const { email, password, name, address, permission } = req.body;
  console.log(email);
  const addEmployee = new User({ email: email, password: password, name: name, address: address, isPermission: permission });
  addEmployee.save();

  return res.redirect(`/employeeEdit?token=${token}`);
});




app.get('/delete/:id', async function (req, res) {
  const id = req.params.id;
  console.log(id);
  await quanao.deleteOne({ id: id });
  return res.redirect(`/admin?token=${token}`);

});




app._router.stack.forEach((middleware) => {
  if (middleware.route && middleware.route.methods.post) {
    console.log('Path:', middleware.route.path);
  }
});


app.get('/employeeEdit', verifyToken, checkAdmin, async function (req, res) {
  const data = await User.find().lean();

  return res.render('edit', {
    layout: 'employeeEdit',
    data: data,
    token: token
  });
});
app.get('/findEmployee/:email', async function (req, res) {
  const emailFromURL = req.params.email;
  const userData = await User.findOne({ email: emailFromURL }).lean();
  res.render('find', {
    layout: 'findEmployee',
    data: userData,
    token: token
  });
});

app.get('/deleteEmployee/:email', async function (req, res) {
  const emailFromURL = req.params.email;
  await User.deleteOne({ email: emailFromURL }).lean();

  return res.redirect(`/employeeEdit?token=${token}`);

});
app.post('/editForm', upload.single('picture'), async function (req, res) {


  const { id, name, price, total } = req.body;
  const picture = req.file.path;
  const employee = { id, name, picture, price, total };


  await quanao.updateOne({ id: id }, { name: name, picture: picture, price: price, total, total });


  return res.redirect(`/admin?token=${token}`);

});
app.post('/editEmployeeForm', upload.none(), async function (req, res) {
  const { email, password, name, address, permission } = req.body;
  const isPermissionTrue = permission === 'true';

  console.log(req.body);

  await User.updateOne(
    { email: email },
    { $set: { name: name, address: address, password: password, isPermission: isPermissionTrue } }
  );
  return res.redirect(`/employeeEdit?token=${token}`);

});
app.get('/changeinfo', async function (req, res) {


  token = req.body.token || req.query.token || req.headers['authorization'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Chưa Đăng Nhập!',
    });
  }

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Đăng Nhập Không Hợp Lệ!',
      });
    }

    req.user = decoded;
    const infoEmployee = req.user;





    const userData = await User.findOne({ email: infoEmployee.email }).lean();
    console.log(userData);
    return res.render('edit', {
      layout: 'changeinfo',
      data: userData,
      token: token
    });
  });





});
app.post('/changeinfo', upload.none(), async function (req, res) {


  const { email, password, name, address } = req.body;


  const userData = await User.updateOne({ email: email }, { name: name, password: password, address: address });


  return res.render('edit', {
    layout: 'changeinfo',
    data: userData,
    token: token,
    message: 'Đã thêm thành công'

  });

});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});