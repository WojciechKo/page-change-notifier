import cheerio from "cheerio";
import fetch from "node-fetch";

import { checker } from "../lib/checker.js";

checker({
  fetcher: async () => {
    const url = "https://split.to/marsprotocol";

    const response = await fetch(url, { method: "GET", redirect: "follow" });
    const page = await response.text();

    const $ = cheerio.load(page);
    return $;
  },
  serializeResponse: ($) => {
    return `${$(".visits").text()}\n${$(".source.text").text()}`;
  },
  message: ($) => {
    return $(".source.text").text();
  },
});
