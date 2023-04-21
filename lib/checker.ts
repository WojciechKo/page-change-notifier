import fs, { promises as fsPromises } from "fs";
import notifier from "node-notifier";
import path from "path";

const getResponseFile = () => {
  const scriptFile = process.argv[1];
  return path.join(
    path.dirname(scriptFile),
    `${path.parse(scriptFile).name}.response.txt`
  );
};

const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const timestamp = () => `${new Date().toJSON()}:`;

type CheckConfig<T> = {
  fetcher: () => Promise<T>;
  serializeResponse: (m: T) => string;
  message: (m: T) => string;
  waitBetweenChecks: number;
  notifyInterval: number;
};

const defaultConfig = (): CheckConfig<any> => {
  return {
    fetcher: () => {
      return Promise.reject("Needs to be implemented!");
    },
    serializeResponse: (m: any) => JSON.stringify(m, null, 2),
    message: (m: any) => JSON.stringify(m),
    waitBetweenChecks: 10,
    notifyInterval: 5,
  };
};

export const checker = async <T>(userConfig: Partial<CheckConfig<any>>) => {
  const config: CheckConfig<any> = { ...defaultConfig(), ...userConfig };
  const responseFile = getResponseFile();

  const response = await config.fetcher();
  const serializedResponse = config.serializeResponse(response);

  const storedResponse = await fsPromises
    .access(responseFile, fs.constants.F_OK)
    .then(() => fsPromises.readFile(responseFile))
    .catch(() => {
      console.log(timestamp(), `Write to file ${responseFile}:`);
      console.log(serializedResponse);
      return fsPromises
        .writeFile(responseFile, serializedResponse)
        .then(() => serializedResponse);
    });

  if (storedResponse == serializedResponse) {
    console.log(timestamp(), "Nothing has changed");
    await sleep(config.waitBetweenChecks);
    checker(userConfig);
  } else {
    for (;;) {
      console.log(timestamp(), "New content!");
      console.log(serializedResponse);
      notifier.notify({
        title: "New content",
        message: config.message(response),
      });
      await sleep(config.notifyInterval);
    }
  }
};
