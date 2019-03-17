const Router = require("express").Router();
const moment = require("moment");
const request = require("request");
const cheerio = require("cheerio");
const Feed = require("feed").Feed;

const feed = new Feed({
  title: "NewsPicks original articles feed",
  description: "This is my personal feed!",
  id: "https://newspicks.com/series",
  link: "https://newspicks.com/series",
  language: "ja",
  copyright: "All rights reserved 2019, yukioh",
  generator: "For personal use",
  author: {
    name: "Yuki Ota"
  }
});

Router.get("/np/original", (req, res, next) => {
  const options = {
    uri: "https://newspicks.com/series",
    method: "GET",
    qs: {
      from: Number(
        moment()
          .utc()
          .format("YYYYMMDDHHmmssSSS")
      ),
      limit: 10,
      _: Number(moment().format("x"))
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      // error
      console.log("error: ", error);
      next();
    }

    try {
      const $ = cheerio.load(body);
      const latest_article_data = $(".news-card").data();
      const latest_updated_ts_at = moment(
        String(latest_article_data.key),
        "YYYYMMDDHHmmssSSS"
      ).format("X");
      const last_updated_ts_at = module.parent.exports.get("last_update_at");

      // if (latest_updated_ts_at > last_updated_ts_at) {
      // new articles
      $(".news-card").each((i, elem) => {
        const id = $(elem).data().id;
        const key = $(elem).data().key;
        const update_at = moment(String(key), "YYYYMMDDHHmmssSSS").format("X");
        if (update_at > last_updated_ts_at) {
          const title = $(elem)
            .children("a")
            .children(".title")
            .text();
          const content = $(elem)
            .children(".user-comment")
            .text();

          const article = {
            title: title,
            id: id,
            link: `https://newspicks.com/news/${id}`,
            description: title,
            content: content,
            date: moment(String(key), "YYYYMMDDHHmmssSSS"),
            image: `https://contents.newspicks.com/images/news/${id}`
          };

          feed.addItem({
            title: article.title,
            id: article.id,
            link: article.link,
            description: article.description,
            content: article.content,
            date: article.date,
            image: article.image
          });
        }
      });
      module.parent.exports.set("last_update_at", latest_updated_ts_at);
      res.set({
        "Content-Type": "application/atom+xml"
      });
      res.status(200).send(feed.atom1());
      // } else {
      //   res.status(304).end();
      // }
    } catch (error) {
      console.log("error: ", error);
      next();
    }
  });
});

module.exports = Router;
