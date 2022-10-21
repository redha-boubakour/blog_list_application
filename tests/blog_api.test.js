const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

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

beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save({});
    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save({});
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length)
})

test('the first blog is about TESTtitle', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('TESTtitle')
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "TESTtitle4",
        author: "TESTauthor4",
        url: "TESTurl4",
        likes: 33
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(
        'TESTtitle4'
    )
})

afterAll(() => {
    mongoose.connection.close()
})