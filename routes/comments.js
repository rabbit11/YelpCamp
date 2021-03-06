var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require('../middleware')


//comments new
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (error, campground) {
        if (error) {
            console.log(error);
        } else {
            res.render("./comments/new", { campground: campground });
        }
    });
});

//comments create
router.post("/", middleware.isLoggedIn, function (req, res) {
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
                    req.flash('success', 'Successfully added comment');
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//EDIT A COMMENT ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
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
router.put('/:comment_id',middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(error, updatedComment){
        if(error){
            res.redirect('back');
        }
        else{
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//DELETE A COMMENT ROUTE
router.delete('/:comment_id',middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(error){
        if(error){
            res.redirect('back');
        }
        else {
            req.flash('success', 'Comment deleted');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});


module.exports = router;