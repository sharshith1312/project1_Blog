var express=require("express")
var app=express()
var methodOverride=require("method-override")
var bodyParser=require("body-parser")
var mongoose=require("mongoose")
var expressSanitizer=require("express-sanitizer")
//app config
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(methodOverride("_method"));
app.use(expressSanitizer());//shold be after body parser

//connecting to database
mongoose.connect('mongodb://localhost:27017/blog_database',{ useNewUrlParser: true,useUnifiedTopology: true  } )

//set up schema

var blogSchema=new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date,default:Date.now}
})

//mongoose .model config
var Blog=mongoose.model("Blog",blogSchema)

/* Blog.create({
    title:"my blog",
    image:"https://images.unsplash.com/photo-1551516116-6129cebf5751?ixlib=rb-1.2.1&dpr=1&auto=format&fit=crop&w=525&q=60",
    body:"Hello this my firs blog post posted in the websoite"

}) */

//RESTful routes

app.get("/",function(req,res){
    res.redirect("/blogs")
})
//index route
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log(err)
        }else{
            res.render("index",{blogs:blogs});
        }
    })
    
})
//new route
app.get("/blogs/new",function(req,res){
    res.render("new")
})


//create post route

app.post("/blogs",function(req,res){
    //retreving data from the forms
    var title=req.body.title;
    var image=req.body.image;
    var body=req.body.body;
    //create object blog
    var newBlog={
        title:title,
        image:image,
        body:body
    }
    newBlog.body=req.sanitize(newBlog.body)//to run html code only(not javascript) in the body
    //create blog
    Blog.create(newBlog,function(err,newBlog){
        if(err){
            res.render("new")
        }else{
            //then redirect to the index
            res.redirect("/blogs")
        }
    
    })
})

//show blog that is getting more information about the blog

app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,selectedBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.render("show",{blog:selectedBlog})
        }
    })
})

//edit route
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            console.log(err)
            res.redirect("/blogs")
        }else{
            res.render("edit",{blog:foundBlog})
        }
    })
    
})
//upadte route
app.put("/blogs/:id",function(req,res){
    //retreving data from the upadted form
    var title=req.body.title;
    var image=req.body.image;
    var body=req.body.body;
    //create object blog
    var updateBlog={
        title:title,
        image:image,
        body:body
    }
    updateBlog.body=req.sanitize(updateBlog.body);
    Blog.findByIdAndUpdate(req.params.id,updateBlog,function(err,updatedBlog){
        if(err){
            // console.log(err)
            res.redirect("/blogs")
        }
        else{
            
            res.redirect("/blogs/"+req.params.id)
        }
    })
    
})
//Delete route

app.delete("/blogs/:id",function(req,res){
    //destroy the blog
    Blog.findByIdAndRemove(req.params.id,function(err,deletedBlog){
        if(err){
            res.send(err)
        }else{
            //redirect to some ehere
            res.redirect("/blogs")
        }
    })
    
    
})



//starting server
var port = process.env.PORT || 3001;
//if any problem in project change port number
app.listen(port, function (){
  console.log("Server Has Started!")
});