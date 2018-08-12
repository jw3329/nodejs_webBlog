var express = require('express');
var app = express();
app.locals.pretty = true;
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views','./pug');
app.get('/',function(req,res) {
  var topics = ['t1','t2','t3'];
  res.render('index',{topics:topics});
});

app.get('/login',function(req,res) {
  res.send('Login Page');
});

app.get('/pugtest',function(req,res) {
  res.render('temp',{title:'testing site', time : Date()});
});

app.get('/writingPost',function(req,res) {
  res.render('post_write');
});

app.listen(3000,function() {
  console.log('connected 3000 port');
});
