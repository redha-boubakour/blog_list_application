const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes;
    };

    return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
    const blogsLikesArray = blogs.map((blog) => blog.likes);
    const favBlog =
        blogs[blogsLikesArray.indexOf(Math.max(...blogsLikesArray))];

    return favBlog;
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
};
