var express = require('express');
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require('../middleware');
var moment = require('moment');

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
router.post("/", middleware.isLoggedIn,function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    var newCampground = { name: name, image: image, price: price, description: description,
         author: author};


    //inserting the new campground to the database
    Campground.create(newCampground, function (error, postedCampground) {
        if (error) {
            console.log(error);
        } else {
            //redirect back to campgrounds
            req.flash('success', 'Successfully added campground');
            res.redirect("/campgrounds");
        }
    });
});

//NEW - page with form to insert a new campground route
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("./campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (error, foundCampground) {
        if (error) {
            console.log(error);
        } else {
            res.render("./campgrounds/show", { campground: foundCampground, moment: moment });
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render('campgrounds/edit', { campground: foundCampground });           
    });
});

//UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect('/campgrounds');
        }
        else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/campgrounds');
        }
        else {
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;