const supertest = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");

const app = require("../app");
const api = supertest(app);

const User = require("../models/user");
const Blog = require("../models/blog");

// Dont work because it dosent wait for the promises in the forEach (the db dosent initialise before the tests)

// beforeEach(async () => {
//     await Blog.deleteMany({})

//     helper.initialBlogs.forEach(async (blog) => {
//       let blogObject = new Blog(blog)
//       await blogObject.save()
//     })
//   })

// Works fine (pretty advanced). doesent handle the order if needed (not needed in our situation)

// beforeEach(async () => {
//     await Blog.deleteMany({})
//     const blogObjects = helper.initialBlogs
//         .map(blog => new Blog(blog))
//     const promiseArray = blogObjects.map(blog => blog.save())
//     await Promise.all(promiseArray)
// })

// Works fine, handle the order and quite easy to understand

beforeEach(async () => {
    await Blog.deleteMany({});

    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save();
    }
});

describe("when there is initially some blogs saved", () => {
    test("blogs are returned as json", async () => {
        await api
            .get("/api/blogs")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
        const response = await api.get("/api/blogs");

        expect(response.body).toHaveLength(helper.initialBlogs.length);
    });
});

describe("viewing a specific blog", () => {
    test("that contain a specific title", async () => {
        const response = await api.get("/api/blogs");
        const titles = response.body.map((r) => r.title);

        expect(titles).toContain("TESTtitle");
    });

    test("with a specific id", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToView = blogsAtStart[0];

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(resultBlog.body).toEqual(blogToView);
    });

    test("the unique identifier property of the last blog is named id", async () => {
        response = await api.get("/api/blogs");
        const identifiers = response.body.map((r) => r.id);
        console.log(identifiers);

        expect(identifiers[identifiers.length - 1]).toBeDefined();
    });
});

describe("adding a blog", () => {
    test("is successful with a status of 201", async () => {
        const newBlog = {
            title: "TESTtitle4",
            author: "TESTauthor4",
            url: "TESTurl4",
            likes: 33,
        };

        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();
        const titles = blogsAtEnd.map((r) => r.title);

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
        expect(titles).toContain("TESTtitle4");
    });

    // to discuss
    test("if the likes property is missing from the request will default his value to 0", async () => {
        const newBlog = {
            title: "TESTtitle7",
            author: "TESTauthor7",
            url: "TESTurl7",
        };

        await api.post("/api/blogs").send(newBlog).expect(201);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

        const likes = blogsAtEnd.map((r) => r.likes);

        expect(likes[likes.length - 1]).toEqual(0);
    });

    // to discuss
    test("without title AND/OR without url will fail with a status of 400", async () => {
        const titleExist = false;
        const urlExist = true;

        const newBlog = {
            ...(titleExist && { title: "TESTtitle5" }),
            author: "TESTauthor5",
            ...(urlExist && { url: "TESTurl5" }),
            likes: 33,
        };

        await api.post("/api/blogs").send(newBlog).expect(400);

        const blogAtEnd = await helper.blogsInDb();

        expect(blogAtEnd).toHaveLength(helper.initialBlogs.length);
    });
});

describe("deleting a blog", () => {
    test("is successful with a status of 204", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[0];

        await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

        const titles = blogsAtEnd.map((r) => r.title);

        expect(titles).not.toContain(blogToDelete.title);
    });
});

// to discuss
describe("updating a blog", () => {
    test("is successful with a status of 200", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToUpdate = blogsAtStart[0];

        const updateBlog = {
            title: "TESTtitleUPDATE2",
            author: "TESTauthorUPDATE2",
            url: "TESTurlUPDATE2",
            likes: 99999,
        };

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updateBlog)
            .expect(200);

        const blogsAtEnd = await helper.blogsInDb();
        const { id, ...blogAtEndWithoutId } = blogsAtEnd[0];

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
        expect(blogAtEndWithoutId).toEqual(updateBlog);
    });
});

afterAll(() => {
    mongoose.connection.close();
});

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash("TESTpassword", 10);
        const user = new User({ username: "TESTusername", passwordHash });

        await user.save();
    });

    test("creation succeeds with a fresh username", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "TESTusername2",
            name: "TESTname2",
            password: "TESTpassword2",
        };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await helper.usersInDb();

        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map((u) => u.username);

        expect(usernames).toContain(newUser.username);
    });

    test(" and if username is already taken, creation fails with statuscode 400", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "TESTusername",
            name: "TESTname",
            password: "TESTpassword",
        };

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        expect(result.body.error).toContain("username must be unique");

        const usersAtEnd = await helper.usersInDb();

        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});
