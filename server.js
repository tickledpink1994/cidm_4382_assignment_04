//
// # NodeJS-Express-EJS-MySQL Example
//

//package import
var bodyParser = require('body-parser');
var express = require('express');
var mysql = require('mysql');

//construct library objects
var app = express();

///// MIDDLEWARE //////////////////////////////////////////////////////////////
//set the static path
app.use(express.static('client'));

// set the view engine to ejs
app.set('view engine', 'ejs');

//setup for body parser
app.use(bodyParser.urlencoded({extended: true}));

///// ROUTES MIDDLEWARE ///////////////////////////////////////////////////////

//form handler for inquiry
app.post('/inquiry', function(req, res){
    //look under req.body -> http://expressjs.com/api.html
  //requires body parser
  
  //get MySQL connection
  var connection = mysql.createConnection({
    host     : process.env.IP,
    user     : process.env.C9_USER,
    database : 'c9'
  });  
  
  console.log(req.body.program);
  
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var program = req.body.program;
  var management = 0;
  var marketing = 0;
  var genbus = 0;
  var economics = 0;
  
  console.log("program: " + req.body.program);
  
  //detect the radio button settings - the req body data is all strings
  //thus it is important to switch on string values
  switch(program){
    //management
    case "1":
      management = 1;
      marketing = 0;
      genbus = 0;
      economics = 0;
      break;
    
    //marketing
    case "2":
      management = 0;
      marketing = 1;
      genbus = 0;
      economics = 0;      
      break;
      
    //general business
    case "3":
      management = 0;
      marketing = 0;
      genbus = 1;
      economics = 0;      
      break;
    
    //economics
    case "4":
      management = 0;
      marketing = 0;
      genbus = 0;
      economics = 1;      
      break;
  }
  
  if((fname.length < 1 || fname.length > 50) || (lname.length < 1 || lname.length > 50) || (email.length < 1 || email.length > 50)){
  
      res.render('index', {insertSuccess: "All fields are required! Please review your information and try again."});
      
  }else{
      
      var isduplicate = connection.query('SELECT COUNT(email) as emailcount FROM inquiries WHERE email=?', email, function(err, result){
          if(!err){
              console.log('success: ' + result);
              if(result.emailcount > 0){
                return true;
              }else{ return false; }
          }else {
              console.log('fail: ' + err);
              return false;
          }
      });
      
      console.log(isduplicate.results);
      
      if(isduplicate){
          
          res.render('index', {insertSuccess: fname + ", thank you for your interest, your information has been recorded."});
          
      }else{
          
          //prepare query object
          //documentation: https://www.npmjs.com/package/mysql#performing-queries
          var inquiry = { firstName: fname,
                          lastName: lname,
                          email: email,
                          managment: management,
                          marketing: marketing,
                          general: genbus,
                          economics: economics
          };
          
          //evesure query - query values are escaped
          var query = connection.query('INSERT INTO inquiries SET ?', inquiry, function(err, result){
            if(!err){
              console.log('success: ' + result);
            }else {
              console.log('fail: ' + err);
            }
          });
          
          //close connection - happens AFTER the middleware is exited
          connection.end(function(err){
            if(!err){
              res.render('index', {insertSuccess: fname + ", thank you for your interest in the College of Business Online Program."});
            }else{
              res.end("Fail");
              console.log('fail: ' + err);
            }
          });
      }
  }
  
});

//handle a query
app.get('/query', function(req, res){
  
  //get MySQL connection
  var connection = mysql.createConnection({
    host     : process.env.IP,
    user     : process.env.C9_USER,
    database : 'c9'
  });  
  
  //open mysql connection
  connection.connect();

  //execute query - the nesting allows this to be sequential in 
  //an async environment  
  connection.query('SELECT * FROM inquiries', function(err, rows, fields){
    
    //if the connection/query did not result in an error
    if(!err){
      var output = "";
      //iterate through the result set
      for(var i = 0; i < rows.length; i++)
      {
        output += rows[i].FirstName + " " + rows[i].LastName + " " + rows[i].Email;
      }
      
      //close the database connection
      connection.end(function(err) {
        if(!err){
          // The connection is terminated now 
          //send the HTTP response
          console.log(output);
          
          //EJS documentation: https://www.npmjs.com/package/ejs
          //render EJS template
          res.render('query', {
            title: 'Inquiries',
            results: rows
          });
        } else {
          //error in receiving records
          res.end("Error in retrieving data: " + err);
        }

      });

    }else{
      //the connection did result in an error
      res.end("Error in working with database: " + err);
    }
  });
});

app.get("/", function(req, res) {
   res.render('index', {insertSuccess: ""});
});

///// SERVE ///////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("app listening");
});
