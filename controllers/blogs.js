const blogsRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({}).populate("user", {
        username: 1,
        name: 1,
    });
    response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
    const blog = await Blog.findById(request.params.id);
    if (blog) {
        response.json(blog);
    } else {
        response.status(404).end();
    }
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
    const body = request.body;
    // the "request.user" is coming from the middleware userExtractor
    const user = request.user;

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id,
    });

    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);

    await user.save();

    response.status(201).json(savedBlog);
});

blogsRouter.delete(
    "/:id",
    middleware.userExtractor,
    async (request, response) => {
        const blogId = request.params.id;
        // the "request.user" is coming from the middleware userExtractor
        const user = request.user;
        const blog = await Blog.findById(blogId);

        if (blog.user.toString() === user.id.toString()) {
            await Blog.findByIdAndRemove(blogId);
            response.status(204).end();
        } else {
            return response.status(403).json({ error: "Forbidden" });
        }
    }
);

blogsRouter.put("/:id", async (request, response) => {
    const blog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
        new: true,
    });
    response.json(updatedBlog);
});

module.exports = blogsRouter;
