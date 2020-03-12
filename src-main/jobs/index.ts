import jobManager from "./job-manager";

export const createThumbnailJob = (src: string, dest: string) => {
  return jobManager.runSharedBackgroundJob(
    `create-thumbnail-job:${src}->${dest}`,
    require.resolve("./create-thumbnail-job"),
    { src, dest }
  );
};

export const globJob = (expression: string, options: any) => {
  return jobManager.runSharedBackgroundJob(
    `glob-job:${expression}(${JSON.stringify(options)})`,
    require.resolve("./glob-job"),
    { expression, options }
  );
};
