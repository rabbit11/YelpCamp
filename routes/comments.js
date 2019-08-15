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

//EDIT A COMMENT ROUTE
router.get('/:comment_id/edit', function(req, res){
    Comment.findById(req.params.comment_id, function(error, foundComment){
        if(error){
            res.redirect('back');
        }
        else{
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//UPDATE A COMMENT ROUTE
router.put('/:comment_id', function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(error, updatedComment){
        if(error){
            res.redirect('back');
        }
        else{
            res.redirect('/campgrounds/' + req.params.id);
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