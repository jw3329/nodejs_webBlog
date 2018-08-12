var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  // port: '3000',
  database : 'jw_web_blog'
});

connection.connect();

connection.query('SELECT * FROM topic', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});

connection.end();
