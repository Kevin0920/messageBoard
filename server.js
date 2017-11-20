var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/basic_mongoose');

// One to many relationship 
var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 3 },
  message: {type: String, required: true, minlength: 8 }, 
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });

var CommentSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 3 },  
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
  text: {type: String, required: true, minlength: 8 }
}, {timestamps: true });
// set our models by passing them their respective Schemas
var Post = mongoose.model('Post', PostSchema);
var Comment = mongoose.model('Comment', CommentSchema);
// Store models into variables


// Get all the posts/messages have made 
app.get('/', function(req, res) {
  Post.find({})
  .populate('comments')
  .exec(function(err, posts) {
    res.render('index', {posts: posts, err:null});
  })
})

// Creating new posts 
app.post('/posts', function(req, res) {
  var newPost = new Post(req.body);
  newPost.save(function(err) {
    if (err) {
      console.log("can't save this post", err);
      res.redirect('/');
    }
    else {
      console.log("DATA POST", req.body);
      res.redirect('/');
    }
  });
})


//Route for creating one comment with the parent post id 
app.post('/posts/:id',function(req,res){
    Post.findOne({_id: req.params.id}, function(err, post){
        var comment = new Comment(req.body);
        comment._post = post._id;
        post.comments.push(comment);
        comment.save(function(err){
            if(err){
                console.log("Can not save this comment!");
                console.log(err);
                res.redirect('/');
            }else{
                post.save(function(err){
                    if(err){
                        console.log("Can not add this comment!");
                        console.log(err);
                        res.redirect('/');
                    }else{
                        res.redirect('/');
                    }
                });
            }
        })
    });
})




app.listen(8000, function() {
    console.log("listening on port 8000");
})
