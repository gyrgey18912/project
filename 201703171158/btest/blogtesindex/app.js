
/**
 * Module dependencies.
 */
var fs = require('mz/fs');
var serve = require('koa-static');
var showdown = require('showdown');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var render = require('./lib/render');
var logger = require('koa-logger');
var route = require('koa-route');
var parse = require('co-body');
var path = require('path');
var koa = require('koa');
var app = module.exports = koa();



var db;
MongoClient.connect("mongodb://localhost:27018/blog", function(err, pDb) {
  if(err) { return console.dir(err); }
  db = pDb;
});

// "database"
function *view(book, file) { // view(mdFile):convert *.md to html
	var fullpath = path.join(__dirname, "/md/"+book+"/"+file);
	var fstat = yield fs.stat(fullpath);
	if (fstat.isFile()) {
		if (this.path.endsWith(".md")) {
			this.type = "html";
			var md = yield fs.readFile(fullpath, "utf8");
			this.body = converter.makeHtml(md);
		} else {
			this.type = path.extname(this.path);
			this.body = fs.createReadStream(fullpath);
		}
	}
}

var app = koa();
var converter = new showdown.Converter();
converter.setOption('tables', true);
//var posts = [];

// middleware

app.use(logger());

app.use(serve(__dirname + '/public'));
// route middleware

app.use(route.get('/', index1));
app.use(route.get('/list', list));
app.use(route.get('/post/new', add));
//app.use(route.get('/post/:id', show));
app.use(route.post('/post', create));
app.use(route.get('/view/:book/:file', view));
// route definitions

/**
 * Post listing.
 */

function *list() {
 var collection = db.collection('post');
  var posts = yield collection.find().toArray();
  this.body = yield render('list', { posts: posts });
}

function *index1() {
 var collection = db.collection('post');
  var posts = yield collection.find().toArray();
  this.body = yield render('index1', { posts: posts });
}

/**
 * Show creation form.
 */

function *add() {
  this.body = yield render('new');
}

/**
 * Show post :id.
 */
/*
function *show(id) {
 var collection = db.collection('post');
  ar posts = yield collection.find({_id:ObjectId(id)}).toArray();
  var post = posts[id];
  if (!post) this.throw(404, 'invalid post id');
  this.body = yield render('show', { post: post });
}

/**
 * Create a post.
 */

function *create() {
  var post = yield parse(this);
//  var id = posts.push(post) - 1;
  post.created_at = new Date;
//  post.id = id;
  var collection = db.collection('post');
  var results = yield collection.insertMany([post], {w:1});
  this.redirect('/');
}

// listen

if (!module.parent) app.listen(3000);

