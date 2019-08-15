var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//comments new
router.get("/new", isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (error, campground) {
        if (error) {
            console.log(error);
        } else {
            res.render("./comments/new", { campground: campground });
        }
    });
});

//comments create
router.post("/", isLoggedIn, function (req, res) {
    //lookup campground by id
    Campground.findById(req.params.id, function (error, campground) {
        if (error) {
            console.log(error);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (error, comment) {
                if (error) {
                    console.log(error);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
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