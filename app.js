const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

// Cấu hình handlebars view engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Cấu hình middleware để phục vụ các file tĩnh từ thư mục public
app.use(express.static('public'));

// Cấu hình routing
app.use('/', require('./routes/index'));

// Khởi động server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
