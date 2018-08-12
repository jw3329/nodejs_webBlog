var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'111111',
  // port:'3000',
  database:'jw_web_blog'
});

conn.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views','./pug');

// app.get(['/','/:id'],function(req,res) {
//   var sql = 'SELECT id, title FROM topic';
//   var id = req.params.id;
//   if(id) {
//     conn.query(sql, function(err,topics,fields) {
//       var sql = 'SELECT * FROM topic WHERE id = ?';
//       conn.query(sql,[id],function(err,topic,fields) {
//         if(err) {
//           console.log(err);
//           res.status(500).send('Internal server error');
//         } else {
//           res.render('index',{topics:topics, topic:topic[0]});
//         }
//       });
//     }
//   } else {
//       console.log('haha');
//       console.log('Home');
//       res.render('index',{topics:topics});
//   }
//   });
// });

app.get(['/', '/topic/:id'], function(req, res){
  var sql = 'SELECT id,title FROM topic';
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('index', {topics:topics, topic:topic[0]});
        }
      });
    } else {
      res.render('index', {topics:topics});
    }
  });
});

// app.get(['/','/:id'],function(req,res) {
//   if(req.params.id) {
//     res.send(req.params.id);
//   } else {
//     res.send('home test');
//   }
// })

app.post('/topic_receiver',function(req,res) {
  var sql = 'INSERT INTO topic (title,description,author) VALUES (?,?,?)';
  conn.query(sql, [req.body.title,req.body.desc,req.body.author], function(err, rows, fields) {
    if(err) {
      console.log(err);
      res.status(500).send('Internal server error');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/login',function(req,res) {
  res.send('Login Page');
});

app.get('/pugtest',function(req,res) {
  res.render('temp',{title:'testing site', time : Date()});
});

app.get('/writingPost',function(req,res) {
  console.log('writingPost');
  res.render('post_write');
});

app.listen(3000,function() {
  console.log('connected 3000 port');
});
