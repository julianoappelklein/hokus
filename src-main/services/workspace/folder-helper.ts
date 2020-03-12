import fs = require("fs-extra");
import path = require("path");

const folderHelper = {
  _readdirPromise: (dirPath: string) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (e, files) => {
        if (e) {
          reject(e);
        }
        resolve(files);
      });
    });
  },

  _lstatPromise: async (filePath: string) => {
    return new Promise((resolve, reject) => {
      fs.lstat(filePath, (e, result) => {
        if (e) {
          reject(e);
        }
        resolve(result);
      });
    });
  },

  _buildTreeLevel: async (treeLevel: any, filePath: string, options: any = {}) => {
    let files: any = await folderHelper._readdirPromise(filePath);
    let promises = [];
    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      let fullFilePath = path.join(filePath, file);
      promises.push(
        folderHelper._lstatPromise(fullFilePath).then((stat: any) => {
          if (options.includeFunc !== undefined) {
            if (!options.includeFunc(fullFilePath, stat)) {
              return Promise.resolve();
            }
          }

          if (stat.isDirectory()) {
            let obj = { name: file, files: [] };
            treeLevel.push(obj);
            return folderHelper._buildTreeLevel(obj.files, fullFilePath, options);
          } else {
            let obj = { name: file };
            treeLevel.push(obj);
            return Promise.resolve();
          }
        })
      );

      await Promise.all(promises);
    }
  },

  getFolderTreeAsync: async (filePath: string, { includeFunc }: any = {}) => {
    let treeRoot: any = [];
    await folderHelper._buildTreeLevel(treeRoot, filePath, { includeFunc });
    return treeRoot;
  }
};
export default folderHelper;
