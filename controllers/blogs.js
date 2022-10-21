const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs);
});

blogsRouter.get("/:id", async (request, response, next) => {
    Blog.findById(request.params.id)
        .then((blog) => {
            if (blog) {
                response.json(blog);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

blogsRouter.post("/", (request, response, next) => {
    const blog = new Blog(request.body);

    blog.save()
        .then((savedBlog) => {
            response.status(201).json(savedBlog);
        })
        .catch(error => next(error));
});

module.exports = blogsRouter;
