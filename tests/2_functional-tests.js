const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const app = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("creates a thread", (done) => {
    const date = new Date();
    chai
      .request(app)
      .post("/api/threads/general")
      .send({ text: "test", delete_password: "test" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        chai
          .request(app)
          .get("/api/threads/general")
          .end((err, res) => {
            assert.equal(date.toDateString(), new Date(res.body[0].created_on).toDateString())
            assert.equal(res.body[0].created_on, res.body[0].bumped_on)
            assert.equal(res.status, 200);
            done();
          });
      });
  });

  test("retrieves most recent 10 threads and 3 replies each for a given board", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isAbove(res.body.length, 0);
        done();
      });
  });

  test("deleting a thread with the incorrect password", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testThreadId = res.body.find(
          (thread) => thread.text === "test"
        )._id;
        chai
          .request(app)
          .delete("/api/threads/general")
          .send({ thread_id: testThreadId, delete_password: "wrongpassword" })
          .end((err, res) => {
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
  });

  test("reporting a thread", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testThreadId = res.body.find(
          (thread) => thread.text === "test"
        )._id;
        chai
          .request(app)
          .put("/api/threads/general")
          .send({ report_id: testThreadId })
          .end((err, res) => {
            assert.equal(res.text, "reported");
            done();
          });
      });
  });

  test("creates a reply", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testThreadId = res.body.find(
          (thread) => thread.text === "test"
        )._id;
        chai
          .request(app)
          .post("/api/replies/general")
          .send({
            thread_id: testThreadId,
            text: "test",
            delete_password: "test",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
  });

  test("retrieves an entire thread", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testThreadId = res.body.find(
          (thread) => thread.text === "test"
        )._id;
        chai
          .request(app)
          .get(`/api/replies/general?thread_id=${testThreadId}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
  });

  test("deletes a reply with incorrect password", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testReplyId = res.body.find((thread) => thread.text === "test")
          .replies[0]._id;
        chai
          .request(app)
          .delete("/api/replies/general")
          .send({ reply_id: testReplyId, delete_password: "wrongpassword" })
          .end((err, res) => {
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
  });

  test("reports a reply", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testReplyId = res.body.find((thread) => thread.text === "test")
          .replies[0]._id;
        chai
          .request(app)
          .put("/api/replies/general")
          .send({ reply_id: testReplyId })
          .end((err, res) => {
            assert.equal(res.text, "reported");
            done();
          });
      });
  });

  test("deletes a reply with correct password", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testReplyId = res.body.find((thread) => thread.text === "test")
          .replies[0]._id;
        chai
          .request(app)
          .delete("/api/replies/general")
          .send({ reply_id: testReplyId, delete_password: "test" })
          .end((err, res) => {
            assert.equal(res.text, "success");
            done();
          });
      });
  });

  test("deleting a thread with the correct password", (done) => {
    chai
      .request(app)
      .get("/api/threads/general")
      .end((err, res) => {
        const testThreadId = res.body.find(
          (thread) => thread.text === "test"
        )._id;
        chai
          .request(app)
          .delete("/api/threads/general")
          .send({ thread_id: testThreadId, delete_password: "test" })
          .end((err, res) => {
            assert.equal(res.text, "success");
            done();
          });
      });
  });
});
