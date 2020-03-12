import * as fs from "fs";

export class FileCacheToken {
  files: Array<string> | null;
  token: string | null;
  isBuilt: boolean;

  constructor(files: Array<string>) {
    this.files = files;
    this.token = null;
    this.isBuilt = false;
  }

  async build(): Promise<FileCacheToken> {
    if (this.isBuilt) {
      return Promise.resolve(this);
    }
    const signatures: string[] = [];
    const promises = (this.files || []).map(
      file =>
        new Promise((resolve, reject) => {
          fs.stat(file, (err, stats) => {
            if (err) return reject(err);
            signatures.push(`${file}>${stats.mtime.getTime()}`);
            resolve();
          });
        })
    );
    await Promise.all(promises);
    this.token = signatures.sort().join("|");
    this.isBuilt = true;
    this.files = null;
    return this;
  }

  async match(other: FileCacheToken): Promise<boolean> {
    await Promise.all([this.build(), other.build()]);
    return this.token === other.token;
  }
}
