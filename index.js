const express = require("express");
const app = express();
const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

app.set("port", port);
app.set("last_update_at", 0);

app.use("/feed", require("./routes/feed.js"));

app.use((err, req, res, next) => {
  console.log("[SERVER ERROR]", err.stack);
  const error_message = err.message || err;
  res.status(500).send({
    error: error_message
  });
});

app.listen(port);
console.log("Server listening on http://" + host + ":" + port);

module.exports = app;
