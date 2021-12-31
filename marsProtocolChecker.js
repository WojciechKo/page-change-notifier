import fetch from "node-fetch";
import cheerio from "cheerio";
import fs, { promises as fsPromises } from "fs";
import notifier from "node-notifier";

const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const timestamp = () => `${new Date().toJSON()}:`;

const marsProtocolCheck = async () => {
  const url = "https://split.to/marsprotocol";

  const response = await fetch(url, { method: "GET", redirect: "follow" });
  const page = await response.text();

  const $ = cheerio.load(page);
  const currentContentBody = $(".highlighted-code").text();

  const contentFilename = `marsProtocolPuzzle.txt.old`;

  const contentBody = await fsPromises
    .access(contentFilename, fs.constants.F_OK)
    .then(() => fsPromises.readFile(contentFilename))
    .catch(() => {
      console.log(timestamp(), "Write:");
      console.log(currentContentBody);
      console.log(`to file: ${contentFilename}`);
      return fsPromises
        .writeFile(contentFilename, currentContentBody)
        .then(() => currentContentBody);
    });

  if (contentBody == currentContentBody) {
    console.log(timestamp(), "Nothing has changed");
    await sleep(10);
    marsProtocolCheck();
  } else {
    const currentContentText = $(".highlighted-code .source").text();
    for (;;) {
      console.log(timestamp(), "New content!", currentContentText);
      notifier.notify({
        title: "New content",
        message: currentContentText,
      });
      await sleep(5);
    }
  }
};

marsProtocolCheck();
