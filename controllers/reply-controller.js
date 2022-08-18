const { pool } = require("../db");
const { v4: uuidv4 } = require("uuid");

const createReply = (name, password, thread_id) => {
  const id = uuidv4();
  pool.query(
    "INSERT INTO replies (_id, text, password, thread_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [id, name, password, thread_id],
    (err, results) => {
      if (err) console.error(err);
      return results;
    }
  );
  pool.query("UPDATE threads SET bumped_on = now() WHERE _id = $1", [
    thread_id,
  ]);
};
const deleteReply = async (password, replyId) => {
  const reply =
    (await pool.query("SELECT * FROM replies WHERE _id = $1", [replyId]))
      ?.rows[0] ?? null;
  if (reply && reply.password === password) {
    await pool.query("UPDATE replies SET text = '[deleted]' WHERE _id = $1", [
      replyId,
    ]);
    return "success";
  } else return "incorrect password";
};

const reportReply = async (replyId) => {
  await pool.query("UPDATE replies SET reported = true WHERE _id = $1", [
    replyId,
  ]);
};

module.exports = {
  createReply,
  deleteReply,
  reportReply
};
