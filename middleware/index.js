var Campground = require('../models/campground');
var Comment = require('../models/comment')
var middlewareObj = {};


middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/login');
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (req.isAuthenticated()) {
            if (err) {
                res.redirect('back');
            }
            else {
                //does user own the comment?
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash('error', "You don't have permission to do that");
                    res.redirect('back');
                }
            }
        }
        else {
            req.flash('error', "You need to be logged in to do that");
            res.redirect("back");
        }

    });
}

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (req.isAuthenticated()) {
            if (err) {
                req.flash('error', 'Campground not found');
                res.redirect('back');
            }
            else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    req.flash('error', "You don't have permission to do that");
                    res.redirect('back');
                }
            }
        }
        else {
            req.flash('error', 'You need to be logged in to do that');
            res.redirect("back");
        }

    });
}

module.exports = middlewareObj;