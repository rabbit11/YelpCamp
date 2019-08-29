var Campground = require('../models/campground');
var Comment = require('../models/comment')
var middlewareObj = {};


middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please Login First');
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
                    res.redirect('back');
                }
            }
        }
        else {
            res.redirect("back");
        }

    });
}

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (req.isAuthenticated()) {
            if (err) {
                res.redirect('back');
            }
            else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    res.redirect('back');
                }
            }
        }
        else {
            res.redirect("back");
        }

    });
}

module.exports = middlewareObj;