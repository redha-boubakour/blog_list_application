const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "TESTtitle",
        author: "TESTauthor",
        url: "TESTurl",
        likes: 20
    }, {
        title: "TESTtitle2",
        author: "TESTauthor2",
        url: "TESTurl2",
        likes: 24
    },
]

const nonExistingId = async () => {
    const blog = new Blog({
        title: "TESTwillBeRemovedSoon",
        author: "TESTwillBeRemovedSoon",
        url: "TESTwillBeRemovedSoon",
        likes: 20
    })
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb
}