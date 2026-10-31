var express = require('express');
var app = express();
var path = require('path');
var mongoose = require("mongoose");

var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');

global.dbHelper = require( './common/dbHelper' );

global.db = mongoose.connect("mongodb://127.0.0.1:27017/test1");

app.use(session({
    secret:'secret',
    cookie:{
        maxAge:1000*60*30
    }
}));

// 设定views变量，意为视图存放的目录
app.set('views', path.join(__dirname, 'views'));


// 设定view engine变量，意为网页模板引擎
//app.set('view engine', 'ejs');
app.set( 'view engine', 'html' );
app.engine( '.html', require( 'ejs' ).__express );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 限制 multipart 解析的字段数与部件数。multer 0.1.x 的 limits 是静默截断：
// 超过 limits.fields 的字段会被丢弃而请求仍以正常状态继续，所以这里给每个请求
// 建一个带回调的解析器，命中上限时直接返回 413，而不是悄悄丢掉用户的字段。
app.use(function (req, res, next) {
    var aborted = false;
    var tooManyParts = function () {
        if (aborted) return;
        aborted = true;
        var err = new Error('multipart form has too many fields or parts');
        err.status = 413;
        next(err);
    };
    multer({
        limits: { fields: 1000, parts: 1001 },
        onFieldsLimit: tooManyParts,
        onPartsLimit: tooManyParts,
        onParseEnd: function (req, next) {
            if (!aborted) next();
        }
    })(req, res, next);
});

// 设定静态文件目录，比如本地文件
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    var err = req.session.error;
    res.locals.message = '';
    if (err) res.locals.message = '<div class="alert alert-danger" style="margin-bottom: 20px;color:red;">' + err + '</div>';
    next();
});


require('./routes')(app);

app.get('/', function(req, res) {
    res.render('login');
});

app.use(function (err, req, res, next) {
    if (err.status !== 413) return next(err);
    res.statusCode = 413;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Multipart form too large\n');
});

app.listen(3000);


