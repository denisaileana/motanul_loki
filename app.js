var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var raseRouter = require('./routes/rase');
var inregistrareRouter = require('./routes/inregistrare');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var utilizatoriRouter = require('./routes/utilizatori');

//sesiune
var session = require('express-session');


var app = express();

//configurare sesiune
app.use(session({
    secret: 'lokiloki',
    resave: true,
    saveUninitialized: true
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

//imi pune userul din sesiune in locals
app.use(function(req, res, next) {
    res.locals.utilizator = req.session.utilizator;
    next();
});



app.use('/rase', raseRouter);
app.use('/inregistrare', inregistrareRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/utilizatori', utilizatoriRouter);
app.use('/', indexRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    console.error(err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('Pagini/error');
});

module.exports = app;