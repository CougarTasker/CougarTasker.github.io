
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
const fs = require('fs');

var upload = multer({dest: './uploads/' });
var app = express();


var workingDir = "../projects/";
app.set('view engine', 'ejs');
app.set('views', './views');

fs.readdir(workingDir,function(err,files){
	if(err){

	}else{
		out = [];
		for(file of files){
			if(fs.statSync(workingDir+file).isDirectory()){
				out.push(file);
			}
		}
		console.log(out);
	}
});

// // for parsing application/json
// app.use(bodyParser.json()); 

// // for parsing application/xwww-
// app.use(bodyParser.urlencoded({ extended: true })); 
// //form-urlencoded

// for parsing multipart/form-data

//app.use(express.static('public'));


app.get('/', function(req, res){
	res.render('home');
});

// app.get('/', function(req, res){
//    res.render('index');
//    console.log("get");
//    console.log(req.body);
// });
// app.post('/',upload.any(),function(req, res){
//    res.render('index');
//    console.log("post");
//    console.log(req.body);
// });




app.listen(80);
