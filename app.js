var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var db = require('./data');

var indexRouter = require('./routes/index');
var submitRouter = require('./routes/submit');
var modRouter = require('./routes/mod');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', indexRouter);
app.use('/submit', submitRouter);
app.use('/moderator', modRouter);

app.post('/complete', (req, res) => {
  var response = { "success": false };
  db.insert(req.body.campus, req.body.branch, req.body.mark, req.body.fbID, req.body.name, req.body.email, (err, resp) => {
    if (!err) {
      response.success = true;
    } else {
      console.log(err.message);
    }
    res.write(JSON.stringify(response));
    res.end();
  });
});

app.post('/getmod', (req, res) => {
  var fb_id = req.body.fb_id;
  var response = { "success": false, "data": [] };
  db.isMod(fb_id, (yes)=> {
    if (yes) {
      db.all( (rows) => {
        response.success = true;
        response.data = rows;

        res.write(JSON.stringify(response));
        res.end();
      });
    } else {
      res.write(JSON.stringify(response));
      res.end();
    }

  });
});

app.post('/delmod', (req, res) => {
  var fb_id = req.body.fb_id;
  var response = { "success": false };

  db.isMod(fb_id, (yes)=>{
    if (yes) {
      db.del(req.body.list, (err) => {
        if (!err)
          response.success = true;
        res.write(JSON.stringify(response));
        res.end();
      });
    } else {
      res.write(JSON.stringify(response));
      res.end();
    }
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
