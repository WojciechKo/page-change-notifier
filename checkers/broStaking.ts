import cheerio from "cheerio";
import fetch from "node-fetch";

import { checker } from "../lib/checker.js";

checker({
  fetcher: async () => {
    const url =
      "https://snowtrace.io/address/0xa3a54fe9231d61d7afa57c92db6b669f86a33ebd";

    const response = await fetch(url, { method: "GET", redirect: "follow" });
    const page = await response.text();

    const $ = cheerio.load(page);
    const content = $(
      "#transactions > div.d-md-flex.align-items-center.mb-3 > p"
    ).text();
    return content;
  },
});
