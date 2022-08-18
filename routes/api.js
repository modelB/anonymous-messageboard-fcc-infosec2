"use strict";

const {
  createThread,
  getThreads,
  deleteThread,
  getThread,
  reportThread,
} = require("../controllers/thread-controller");

const { createReply, deleteReply, reportReply } = require("../controllers/reply-controller");

module.exports = function (app) {
  app.route("/api/threads/:board").post((req, res) => {
    const { text, delete_password } = req.body;
    const { board } = req.params;
    createThread(text, delete_password, board);
    res.send(200);
  });

  app.route("/api/threads/:board").delete(async (req, res) => {
    const { thread_id, delete_password } = req.body;
    const { board } = req.params;
    const resMsg = await deleteThread(thread_id, delete_password);
    res.status(200).send(resMsg);
  });

  app.route("/api/replies/:board").post(async (req, res) => {
    const { text, delete_password, thread_id } = req.body;
    const apiRes = await createReply(text, delete_password, thread_id);
    res.send(apiRes);
  });

  app.route("/api/threads/:board").get(async (req, res) => {
    const { board } = req.params;
    let threads = await getThreads(board);
    threads = threads.map((thread) => {
      if (!thread.replies[0]) thread.replies = [];
      else if (thread.replies.length > 3)
        thread.replies = thread.replies.slice(0, 3);
      // thread.replycount = 0;
      return thread;
    });
    res.status(200).send(threads);
  });
  app.route("/api/replies/:board").get(async (req, res) => {
    const threadId = req.query?.thread_id ?? null;
    if (threadId) {
      const thread = await getThread(threadId);
      res.status(200).send(thread);
    } else res.send(404);
  });
  app.route("/api/replies/:board").delete(async (req, res) => {
    const { delete_password, reply_id } = req.body;
    const resMsg = await deleteReply(delete_password, reply_id);
    res.status(200).send(resMsg)
  });

  app.route("/api/replies/:board").put(async (req, res) => {
    const { reply_id } = req.body;
    await reportReply(reply_id);
    res.status(200).send('reported')
  });

  app.route("/api/threads/:board").put(async (req, res) => {
    const { report_id } = req.body;
    await reportThread(report_id);
    res.status(200).send('reported')
  });
};
