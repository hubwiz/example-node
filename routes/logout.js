module.exports = function ( app ) {
    app.get('/logout', function(req, res){
        req.session.user = null;
        req.session.error = null;
        res.redirect('/');
    });
}