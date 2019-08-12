var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Campground = require("./models/campground"),
    Comment = require("./models/comment");
    seedDB = require("./seeds");

mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
seedDB();


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
            res.render("./campgrounds/index", {campgrounds:allCampgrounds});
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
app.get("/campgrounds/:id/comments/new", function(req, res){
    Campground.findById(req.params.id, function(error, campground){
        if(error){
            console.log(error);
        }else{
            res.render("./comments/new", {campground: campground});
        }
    });
});

//CREATE ROUTE
app.post("/campgrounds/:id/comments", function(req, res){
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

//server starter
app.listen(3000, function(){
    console.log("The Yelp Camp server has started");
});