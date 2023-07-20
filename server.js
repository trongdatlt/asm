var express = require('express');
var app = express();
const fs = require('fs');
var expressHbs = require('express-handlebars');
app.engine('.hbs', expressHbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('views/uploads'));
var items ;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Đường dẫn thư mục để lưu trữ tệp tải lên
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', function(req, res){
   
  //doc du lieu tu data,json len list
fs.readFile('data.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Lỗi khi đọc tệp JSON:', err);
    return;
  }

  const    jsonData = JSON.parse(data);
  res.render('home',{
     layout: 'main',
     data: jsonData
     
  });
});




});

app.get('/login', function(req, res){
  res.render('login',{
    layout: 'dangnhap',
  
    
 });
});


app.get('/register', function(req, res){
  res.render('login',{
    layout: 'dangky',
  
    
 });

});
app.get('/edit1', function(req, res){
   
      //doc du lieu tu data,json len list
   fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc tệp JSON:', err);
        return;
      }
  
      const    jsonData = JSON.parse(data);
      res.render('edit',{
         layout: 'setting1',
         data: jsonData
         
      });
   });

 
  
   
});
app.get('/find/:id', upload.single('image'),function(req, res){  
   
  //doc du lieu tu data,json len list
fs.readFile('data.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Lỗi khi đọc tệp JSON:', err);
    return;
  }
  try {
    id = req.params.id;
    const jsonData = JSON.parse(data);

    // Tìm dữ liệu với ID tương ứng
    const result = jsonData.find(item => item.id == id);
    if (result) {
      res.render('find',{
        layout: 'find1',
        data: result
        
     });
    } else {
      res.status(404).send('Data not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error parsing data');
  }

 
  
});




});

app.post('/addEmployee', upload.single('image'), (req, res) => {

   const { id, name, price } = req.body;
       var oldpath = req.file.path;
     const   picture= "uploads/" +req.file.originalname;
 
       fs.rename(oldpath, picture, function (err) {
         if (err) {
           console.error(' đổi tên tệp tin:', err);
           return res.status(500).json({ error: 'Lỗi  đổi tên tệp tin' });
         }

       });

       const employee = { id, name, picture, price };
      console.log(employee);
       fs.readFile('data.json', 'utf8', (err, data) => {
         if (err) {
           console.error('Lỗi khi đọc tệp JSON:', err);
           return res.status(500).json({ error: 'Lỗi khi đọc tệp JSON' });
         }
         let employees = JSON.parse(data);
         employees.push(employee);
         fs.writeFile('data.json', JSON.stringify(employees), 'utf8', err => {
           if (err) {
             console.error('Lỗi khi ghi vào tệp JSON:', err);
             return res.status(500).json({ error: 'Lỗi khi ghi vào tệp JSON' });
           }
     
     });
     res.redirect('/edit1');
   });
 });
 

 app.post('/editEmployeeForm',upload.single('picture'), function(req, res) {

  console.log("da vao edit");
  const { id, name, price } = req.body;
  const picture = "uploads/" + req.file.originalname;
  const employee = { id, name, picture, price };
  console.log(employee);
  // Đổi tên tệp tin
  fs.rename(req.file.path, picture, function (err) {
    if (err) {
      console.error('Lỗi khi đổi tên tệp tin:', err);
      return res.status(500).json({ error: 'Lỗi khi đổi tên tệp tin' });
    }
    console.log('Đổi tên tệp tin thành công');

    // Đọc dữ liệu từ file JSON
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc tệp JSON:', err);
        return res.status(500).json({ error: 'Lỗi khi đọc tệp JSON' });
      }
console.log('đọc tập tin thành công');
      // Cập nhật dữ liệu
      const updatedData = JSON.parse(data).map(item => {
        if (item.id === id) {
          return { ...item, name, picture, price };
        }
        return item;
      });
      console.log(updatedData);
      // Ghi dữ liệu mới vào file JSON
      fs.writeFile('data.json', JSON.stringify(updatedData, null, 2), (err) => {
        if (err) {
          console.error('Lỗi khi ghi tệp JSON:', err);
          return res.status(500).json({ error: 'Lỗi khi ghi tệp JSON' });
        }

        console.log('Dữ liệu đã được cập nhật thành công');
        return  res.redirect('/edit1');
      });
    });
  });
});




app.get('/delete/:id', function(req, res) {
  const id = req.params.id;
  console.log(id);
  // Đọc dữ liệu từ file JSON
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Lỗi khi đọc tệp JSON:', err);
      return res.status(500).json({ error: 'Lỗi khi đọc tệp JSON' });
    }

    // Xóa dữ liệu dựa trên ID
    const updatedData = JSON.parse(data).filter(item => item.id !== id);

    // Ghi dữ liệu mới vào file JSON
    fs.writeFile('data.json', JSON.stringify(updatedData, null, 2), (err) => {
      if (err) {
        console.error('Lỗi khi ghi tệp JSON:', err);
        return res.status(500).json({ error: 'Lỗi khi ghi tệp JSON' });
      }

      console.log('Dữ liệu đã được xóa thành công');
      return res.redirect('/edit1');
    });
  });
});

  

    
app._router.stack.forEach((middleware) => {
  if (middleware.route && middleware.route.methods.post) {
    console.log('Path:', middleware.route.path);
  }
});



app.listen(3001);