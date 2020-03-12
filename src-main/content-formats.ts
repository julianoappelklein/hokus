export const SUPPORTED_CONTENT_EXTENSIONS = ["md", "markdown", "html"];

export const allValidContentFilesExt = function(filePath: string) {
  return filePath && (filePath.endsWith(".md") || filePath.endsWith(".markdown"));
};

export const isContentFile = function(filePath: string) {
  if (filePath === undefined) return false;
  let parts = filePath.split(".");
  return SUPPORTED_CONTENT_EXTENSIONS.indexOf(parts[parts.length - 1]) >= 0;
};
