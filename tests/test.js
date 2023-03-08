process.env.NODE_ENV = "test";

import request from "supertest";
import { expect } from "chai";
import fs from "fs";
import mock from "mock-fs";
import app from "../src/app.js";

const avatar = {
    userId: "1234567890",
    filename: "04a0c7e6ec63e97c034912d68df90d09.webp"
};

const avatarFile = fs.readFileSync("./tests/fixtures/04a0c7e6ec63e97c034912d68df90d09.webp");
const notavalidimage = fs.readFileSync("./tests/fixtures/notavalidimage");

beforeEach(() => {
    mock({
        "/cdn/avatars": {
            [avatar.userId]: {
                [avatar.filename]: avatarFile
            }
        },
        "/invalidfile.txt": notavalidimage
    });
})

describe("Read", () => {
    it("should 404 on unknown files", (done) => {
        const nonExistentFile = "abc123.webp";

        request(app)
            .get("/avatars/1983754/" + nonExistentFile)
            .expect(404)
            .expect("Image not found.")
            .end(done);
    });

    it("should 400 on invalid parameters", (done) => {
        const invalidId = "34289734_123";

        request(app)
            .get("/icons/" + invalidId + "/somehash.webp")
            .expect(400, done);
    });

    it("should 200 with image when correct input", (done) => {
        request(app)
            .get("/avatars/" + avatar.userId + "/" + avatar.filename)
            .expect(200)
            .expect("Content-Type", "image/webp")
            .end(done);
    });
});

describe("Write", () => {
    const avatarPath = "/cdn/avatars/" + avatar.userId + "/" + avatar.filename;

    it("should not allow write without authorization token", (done) => {
        request(app)
            .put("/avatars/" + avatar.userId)
            .attach("avatar", avatarPath)
            .expect(403)
            .expect("Forbidden.", done);
    });

    it("should not write invalid file", (done) => {
        request(app)
            .put("/avatars/" + avatar.userId)
            .attach("avatar", "/invalidfile.txt")
            .set("Authorization", "DUMMY_SECRET")
            .expect(400)
            .expect({ message: "Invalid file" }, done);
    });

    it("should write a valid file when authorized", async () => {
        const res = await request(app)
            .put("/avatars/" + avatar.userId)
            .attach("avatar", avatarPath)
            .set("Authorization", "DUMMY_SECRET")
            .expect(201);

        expect(res.body).to.have.property("imageHash");

        const imageHash = res.body.imageHash;

        await request(app)
            .get("/avatars/" + avatar.userId + "/" + imageHash + ".webp")
            .expect(200)
            .expect("Content-Type", "image/webp");
    });
});
