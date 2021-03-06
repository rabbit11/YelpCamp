require('dotenv').config();

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require("./models/user"),
    methodOverride = require('method-override'),
    seedDB = require("./seeds"),
    flash = require('connect-flash');

//requiring routes
var commentRoutes = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index');


var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelpcamp"
mongoose.connect(url);

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());

//seed the database
// seedDB();

//passport configuration
app.use(require('express-session')({
    secret: 'A',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

//server starter

// app.listen(3000, function(){
//     console.log("The Yelp Camp server has started");
// });

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});