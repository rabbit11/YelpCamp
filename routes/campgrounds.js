var express = require('express');
var router = express.Router();
var Campground = require("../models/campground");

//INDEX - all campgrounds page route
router.get("/", function (req, res) {
    //retrieving all campgrounds from the database
    Campground.find({}, function (error, allCampgrounds) {
        if (error) {
            console.log("Fail retrieving campgrounds");
        } else {
            res.render("./campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user });
        }
    });
});

//CREATE - posting a new campground route
router.post("/", isLoggedIn,function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    var newCampground = { name: name, image: image, description: description,
         author: author};


    //inserting the new campground to the database
    Campground.create(newCampground, function (error, postedCampground) {
        if (error) {
            console.log(error);
        } else {
            //redirect back to campgrounds
            res.redirect("/campgrounds");
        }
    });
});

//NEW - page with form to insert a new campground route
router.get("/new", isLoggedIn, function (req, res) {
    res.render("./campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (error, foundCampground) {
        if (error) {
            console.log(error);
        } else {
            res.render("./campgrounds/show", { campground: foundCampground });
        }
    });
});

//middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;