let replaceRGBRegExp = /rgb[(]([0-9]+,[0-9]+,[0-9]+)[)]/i;

const rgbToHex = (rgb: number) => {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

const numberToHex = (n: number) => {
  var hex = Number(Math.round(n * 255)).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

export const addAlpha = (color: string, alpha: number) => {
  if (color.startsWith("#")) {
    return color + numberToHex(alpha);
  } else {
    return color.replace(replaceRGBRegExp, `rgba($1, ${alpha})`);
  }
};
