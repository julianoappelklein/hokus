import glob = require("glob");

const backgroundJobAction: (params: { expression: string; options?: any }) => Promise<Array<string>> = async ({
  expression,
  options
}) => {
  return new Promise((resolve, reject) => {
    glob(expression, options, (err: any, matches: string[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(matches);
    });
  });
};

export default backgroundJobAction;
