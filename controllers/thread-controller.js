const { pool } = require("../db");
const { v4: uuidv4 } = require("uuid");

const createThread = (name, password, board) => {
  const id = uuidv4();
  pool.query(
    "INSERT INTO threads (_id, text, delete_password, board) VALUES ($1, $2, $3, $4) RETURNING *",
    [id, name, password, board],
    (err, results) => {
      if (err) console.error(err);
      return results;
    }
  );
};

const deleteThread = async (thread_id, password) => {
    const matchingThread = (await pool.query('SELECT * FROM threads WHERE _id = $1', [thread_id]))?.rows[0] ?? null;
    if (matchingThread.delete_password === password || !matchingThread.delete_password) {
    await pool.query(
      "DELETE FROM replies WHERE thread_id = $1",
      [thread_id]);
    await pool.query(
        "DELETE FROM threads WHERE _id = $1",
        [thread_id]);
        return 'success';
    } else return 'incorrect password';
  };

const getThreads = async (board) => {
    let threads = (await pool.query(
    `SELECT threads._id, threads.text, threads.created_on, threads.bumped_on, json_agg(replies) AS replies, COUNT(replies) AS replyCount
    FROM threads
    FULL JOIN replies
    ON threads._id = replies.thread_id
    WHERE board = $1
    GROUP BY threads._id
    ORDER BY created_on DESC`,
    [board]
  )).rows;
  threads = threads.map(thread => {
    thread.replies = thread.replies.map(reply => {
        if (reply) {
            delete reply.delete_password;
            delete reply.reported;
        }
        return reply;
    })
    return thread;
  })
  return threads.slice(0, 10);
};

const getThread = async (threadId) => {
    const thread = (await pool.query(
    `SELECT threads._id, threads.text, threads.created_on, threads.bumped_on, json_agg(replies) AS replies, COUNT(replies) AS replyCount
    FROM threads
    FULL JOIN replies
    ON threads._id = replies.thread_id
    WHERE threads._id = $1
    GROUP BY threads._id`,
    [threadId]
  )).rows[0];
  thread.replies = thread.replies.map(reply => {
    if (reply) {
        delete reply.delete_password;
        delete reply.reported;
    }
    return reply;
  })
  return thread;
};

const reportThread = async (threadId) => {
    await pool.query("UPDATE threads SET reported = true WHERE _id = $1", [
      threadId,
    ]);
  };

module.exports = {
  createThread,
  getThreads,
  deleteThread,
  getThread,
  reportThread
};
