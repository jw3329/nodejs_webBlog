var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');
var bcrypt = require('bcrypt');
var fs = require('fs');
const saltRounds = 10;
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

app.use(function(req,res,next){
   res.locals.firstname = req.session.firstname;
   res.locals.lastname = req.session.lastname;
   res.locals.id = req.session.id;
   next();
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
          throwError(res,err);
        } else {
          if(req.session.firstname && req.session.lastname) {
            res.render('index', {topics: topics, topic:topic[0]});
          } else {
            res.render('index', {topics:topics, topic:topic[0]});
          }
        }
      });
    } else {
      if(req.session.firstname && req.session.lastname) {
        res.render('index', {topics: topics});
      } else {
        res.render('index', {topics:topics});
      }
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
  var sql = 'SELECT * FROM users INNER JOIN passwordinfo ON users.passwordId = passwordinfo.id WHERE username = ?';
  conn.query(sql,[uname],function(err,rows,fields) {
    if(err) {
      throwError(res,err);
    } else {
      if(rows.length === 0) {
        res.send('no user or wrong username<p><a href="/signin">Sign in</a></p>');
      } else {
        var row = rows[0];
        bcrypt.compare(pass,row.hash,function(err,result) {
          if(err) {
            throwError(res,err);
          } else {
            if(result) {
              req.session.userId = row.id;
              req.session.firstname = row.firstname;
              req.session.lastname = row.lastname;
              req.session.save(function() {
                console.log(req.session);
                // res.send(req.session);
                if(req.session.write) {
                  delete req.session.write;
                  res.redirect('/diary/new');
                } else {
                  res.redirect('/');
                }
              });
            } else {
              res.send('wrong password<p><a href="/signin">Sign in</a></p>');
            }
          }
        });
      }
    }
  });
});

app.get('/post',function(req,res) {

  // var sql = 'SELECT id,title FROM topic';
  // conn.query(sql, function(err, topics, fields){
  //   var id = req.params.id;
  //   if(id){
  //     var sql = 'SELECT * FROM topic WHERE id=?';
  //     conn.query(sql, [id], function(err, topic, fields){
  //       if(err){
  //         throwError(res,err);
  //       } else {
  //         if(req.session.firstname && req.session.lastname) {
  //           res.render('post', {firstname:req.session.firstname, lastname: req.session.lastname, topics: topics, topic:topic[0]});
  //         } else {
  //           res.render('post', {topics:topics, topic:topic[0]});
  //         }
  //       }
  //     });
  //   }
  // });
  var sql = 'SELECT * FROM topic';
  conn.query(sql,function(err,topics,fields) {
    if(err) {
      throwError(res,err);
    } else {
      // var hi = {'a':'b'};
      // console.log(JSON.stringify(req.session));
      // console.log(req.session.firstname);
      var session = req.session;
      res.render('post', {topics:topics});
    }
  });
});

app.get('/pug/css/:name', function(req,res) {
  fs.readFile('./pug/css/' + req.params.name, function(err,data) {
    if(err) {
      throwError(res,err);
    } else {
      res.send(data);
    }
  });
});

app.get('/post/:id',function(req,res) {
  var sql = 'SELECT * FROM topic';
  conn.query(sql,function(err,topics,fields) {
    if(err) {
      throwError(res,err);
    } else {
      res.render('post_showing', {topics:topics});
    }
  });
});

app.get('/welcome', function(req,res) {
  res.render('welcome');
});

app.get('/signout', function(req,res) {
  delete req.session.firstname;
  delete req.session.lastname;
  delete req.session.userId;
  req.session.save(function() {
    res.redirect('/');
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
  var body = req.body;
  bcrypt.hash(body.password,saltRounds,function(err,hash) {
    if(err) {
      console.log('Error generating hash');
      res.send('Server error generating hash');
    } else {
      var sql = 'INSERT INTO passwordinfo (hash) VALUES (?)';
      conn.query(sql,[hash],function(err,row,field) {
        if(err) {
          throwError(res,err);
        } else {
          var sql = 'SELECT id FROM passwordinfo WHERE hash = ?';
          conn.query(sql,[hash],function(err2,rowId,fields2) {
            var sql = 'INSERT INTO users (firstname,lastname,email,register,username,passwordId) VALUES (?,?,?,NOW(),?,?)';
            conn.query(sql,[body.firstname,body.lastname,body.email,body.username,rowId[0].id],function(err3,rows,fields) {
              if(err) {
                throwError(res,err3);
              } else {
                req.session.userId = rowId[0].id;
                req.session.firstname = body.firstname;
                req.session.lastname = body.lastname;
                req.session.save(function() {
                  res.redirect('/');
                });
              }
            });
          });
        }
      });
    }
  });
});

app.get('/diary/:id(\\d+)/delete', function(req,res) {
  if(!req.session.id) {
    res.render('different_id');
  } else {
    var sql = 'SELECT userId FROM diary WHERE id = ?';
    var id = req.params.id;
    conn.query(sql,[id],function(err,rows,fields) {
      if(err) {
        throwError(res,err);
      } else {
        if(rows[0].userId == req.session.userId) {
          var sql = 'DELETE FROM diary WHERE id = ?';
          conn.query(sql,[id],function(err,rows,fields) {
            if(err) {
              throwError(res,err);
            } else {
              res.redirect('/diary');
            }
          });
        } else {
          res.render('different_id');
        }
      }
    });
  }
});

app.get('/diary/:id(\\d+)',function(req,res) {
  var id = req.params.id;
  var sql = 'SELECT * FROM diary WHERE id = ?';
  conn.query(sql,[id],function(err,rows,fields) {
    if(err) {
      throwError(res,err);
    } else {
      if(rows.length === 0) {
        res.send('Invalid id');
      } else {
        res.render('diary_post',{row:rows[0]});
      }
    }
  });
});

app.get('/diary/new', function(req,res) {
  if(req.session.firstname) {
    res.render('diary_new');
  } else {
    req.session.write = true;
    req.session.save(function() {
      res.render('diary_err');
    });
  }
});

app.post('/diary/new/process', function(req,res) {
  var sql = 'INSERT INTO diary (title,description,author,userId,created) VALUES (?,?,?,?,NOW())';
  var body = req.body;
  conn.query(sql,[body.title,body.description,`${req.session.firstname} ${req.session.lastname}`,req.session.userId], function(err,rows,fields) {
    if(err) {
      throwError(res,err);
    } else {
      res.redirect('/diary');
    }
  });
});

app.get('/diary',function(req,res) {
  var sql = 'SELECT * FROM diary';
  conn.query(sql,function(err,rows,fields) {
    if(err) {
      throwError(res,err);
    } else {
      res.render('diary',{rows:rows});
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
