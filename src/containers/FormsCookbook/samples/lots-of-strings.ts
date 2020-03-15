import { FormCookbookSample } from "../samples";

const items = [];
for (let i = 0; i < 50; i++) { items.push(i); }

export const lotsOfString: FormCookbookSample = {
  key: "lots-of-string",
  title: "Lots of Strings",
  description: "Lots of strings.",
  fields: items.map((i) => {
    return { key: `title-${i}`, title: `Title-${i}`, type: "string" };
  }),
  values: {}
};
