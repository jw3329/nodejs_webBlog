var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');
var conn = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'111111',
  // port:'3000',
  database:'jw_web_blog'
});
app.use(session({
  secret: '123456&*asdfghjk',
  resave: false,
  saveUninitialized: true
  // cookie: { secure: true }
}));

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
          throwError(res,err);
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
      throwError(res,err);
    } else {
      res.redirect('/topic/' + req.body.title);
    }
  });
});

app.post('/loginCheck', function(req,res) {
  var uname = req.body.username;
  var pass = req.body.password;
  var sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  conn.query(sql,[uname,pass],function(err,rows,fields) {
    if(err) {
      throwError(res,err);
    } else {
      if(rows.length === 0) {
        res.send('no user or wrong username or password<p><a href="/signin">Sign in</a></p>');
      } else {
        var row = rows[0];
        req.session.firstname = row.firstname;
        req.session.lastname = row.lastname;
        req.session.save(function() {
          // console.log(req.session);
          // res.send(req.session);
          res.redirect('/welcome');
        });
      }
    }
  });
});

app.get('/welcome', function(req,res) {
  // res.send(req.session);
  // console.log(req.session);
  // res.send(req.session);
  if(req.session.firstname && req.session.lastname) {
    res.render('welcome',{firstname:req.session.firstname,lastname:req.session.lastname});
  } else {
    res.render('welcome');
  }
});

app.get('/signout', function(req,res) {
  delete req.session.firstname;
  delete req.session.lastname;
  req.session.save(function() {
    res.redirect('/welcome');
  });
});

// app.get('/welcome', function(req,res) {
//   console.log(req);
//   for(var i=0;i<100;i++)
//     console.log(req.session);
//     res.send('done');
// });

function throwError(res,err) {
  console.log(err);
  res.status(500).send('Internal server error');
}

app.get('/signin',function(req,res) {
  res.render('signin');
});

app.get('/signup',function(req,res) {
  res.render('signup');
});

app.post('/signup', function(req,res) {
  var sql = 'INSERT INTO users (firstname,lastname,email,register,username,password) VALUES (?,?,?,NOW(),?,?)';
  var body = req.body;
  conn.query(sql,[body.firstname,body.lastname,body.email,body.username,body.password],function(err,rows,fields) {
    if(err) {
      throwError(res,err);
    } else {
      req.session.firstname = body.firstname;
      req.session.lastname = body.lastname;
      req.session.save(function() {
        res.redirect('/welcome');
      });
    }
  });
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
