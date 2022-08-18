const { pool } = require("../db");
const { v4: uuidv4 } = require("uuid");

const createReply = async (name, password, thread_id) => {
  const id = uuidv4();
  const date = new Date();
  const repliesRes = await pool.query(
    "INSERT INTO replies (_id, text, delete_password, thread_id, created_on) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [id, name, password, thread_id, date]
  );

  const updateThreadRes = await pool.query("UPDATE threads SET bumped_on = $1 WHERE _id = $2 RETURNING *", [
    date,
    thread_id,
  ]);
  return updateThreadRes.rows[0];
};
const deleteReply = async (password, replyId) => {
  const reply =
    (await pool.query("SELECT * FROM replies WHERE _id = $1", [replyId]))
      ?.rows[0] ?? null;
  if (reply && reply.delete_password === password) {
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
  reportReply,
};
