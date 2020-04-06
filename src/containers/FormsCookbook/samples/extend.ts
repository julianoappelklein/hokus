import { FormCookbookSample } from "./types";

export const extend: FormCookbookSample = {
  key: "extend",
  title: "Animal Extend",
  description: "A form that can be extended forms.",
  fields: [
    { key: "name", title: "Animal Name", type: "string" },
    {
      key: "type",
      title: "Animal Type",
      type: "select",
      options: [{ value: "dog" }, { value: "cat" }, { value: "bird" }]
    },
    {
      key: "typeExtender",
      type: "extend",
      selectorKey: "type",
      clearExcept: ["name", "type"],
      types: [
        {
          key: "dog",
          fields: [
            {
              key: "favoriteBrand",
              title: "Favorite Food Brand",
              type: "select",
              options: [{ value: "Royal Canin" }, { value: "Barking Heads" }, { value: "Canagan" }]
            },
            { key: "legs", title: "Legs", type: "readonly", default: "4" }
          ]
        },
        {
          key: "cat",
          fields: [
            {
              key: "favoriteBrand",
              title: "Favorite Food Brand",
              type: "select",
              options: [{ value: "Iams" }, { value: "Meow Mix" }, { value: "Blue Buffalo" }]
            },
            { key: "legs", title: "Legs", type: "readonly", default: "4" }
          ]
        },
        {
          key: "bird",
          fields: [
            {
              key: "favoriteBrand",
              title: "Favorite Food Brand",
              type: "select",
              options: [{ value: "Lyric Fruit" }, { value: "Wagner's" }, { value: "Wild Delight" }]
            },
            { key: "legs", title: "Legs", type: "readonly", default: "2" },
            { key: "wings", title: "Wings", type: "readonly", default: "yes" }
          ]
        }
      ]
    }
  ],
  values: {}
};
