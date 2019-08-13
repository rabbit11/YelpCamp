var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
seedDB();


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
    next();
});


//landing page route
app.get("/", function(req, res){
    res.render("landing");
});

//INDEX - all campgrounds page route
app.get("/campgrounds", function(req, res){
    //retrieving all campgrounds from the database
    Campground.find({}, function(error, allCampgrounds){
        if(error){
            console.log("Fail retrieving campgrounds");
        }else{
            res.render("./campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user});
        }
    });
});

//CREATE - posting a new campground route
app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name:name , image:image, description:description};

    //inserting the new campground to the database
    Campground.create(newCampground, function(error, postedCampground){
        if(error){
            console.log(error);
        }else{
            //redirect back to campgrounds
            res.redirect("/campgrounds");
        }
    });
});

//NEW - page with form to insert a new campground route
app.get("/campgrounds/new", function(req, res){
    res.render("./campgrounds/new");
});

//SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(error, foundCampground) {
        if(error){
            console.log(error);
        }else{
            res.render("./campgrounds/show", {campground: foundCampground});
        }
    });
});

// ======================
    // COMMENTS ROUTES
// ======================

//NEW ROUTE
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(error, campground){
        if(error){
            console.log(error);
        }else{
            res.render("./comments/new", {campground: campground});
        }
    });
});

//CREATE ROUTE
app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
    //lookup campground by id
    Campground.findById(req.params.id, function(error, campground){
        if(error){
            console.log(error);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, function(error, comment){
                if(error){
                    console.log(error);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// ================
// AUTH ROUTES
// ================

app.get('/register', function(req, res){
    res.render('register');
});

//handle sign up logic
app.post('/register', function(req, res){
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function(){
            res.redirect('/campgrounds');
        });
    }); 
});

//show login form
app.get('/login', function(req, res){
    res.render('login');
});

//handling login logic
app.post('/login', passport.authenticate('local',
    {successRedirect:'/campgrounds',
    failureRedirect:'/login'
    }),function(req, res){

});

//logout route
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/campgrounds');
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}
//server starter
app.listen(3000, function(){
    console.log("The Yelp Camp server has started");
});