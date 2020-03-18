import { FormCookbookSample } from "./types";

let fields: Array<any> = [
  {
    key: "nest-grouped-section",
    title: "Nest Grouped",
    type: "section",
    groupdata: true,
    fields: [
      {
        key: "nest1",
        title: "Nest1",
        type: "nest",
        groupdata: true,
        fields: [{ key: "number1", title: "Nested Number", type: "number" }]
      },
      {
        key: "nest2",
        title: "Nest2",
        type: "nest",
        groupdata: true,
        fields: [
          {
            key: "nest3",
            title: "Nest3",
            type: "nest",
            groupdata: true,
            fields: [{ key: "number2", title: "Nested Number", type: "number" }]
          }
        ]
      }
    ]
  },
  {
    key: "nest-ungrouped-section",
    title: "Nest Ungrouped",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "nest4",
        title: "Nest4",
        type: "nest",
        groupdata: true,
        fields: [{ key: "number3", title: "Nested Number", type: "number" }]
      },
      {
        key: "nest5",
        title: "Nest5",
        type: "nest",
        groupdata: true,
        fields: [
          {
            key: "nest6",
            title: "Nest6",
            type: "nest",
            groupdata: true,
            fields: [{ key: "number4", title: "Nested Number", type: "number" }]
          }
        ]
      }
    ]
  },
  {
    key: "nest7",
    title: "Nest7",
    type: "nest",
    groupdata: true,
    fields: [{ key: "number5", title: "Nested Number", type: "number" }]
  },
  {
    key: "nest8",
    title: "Nest8",
    type: "nest",
    groupdata: true,
    fields: [
      {
        key: "nest9",
        title: "Nest9",
        type: "nest",
        groupdata: true,
        fields: [{ key: "number6", title: "Nested Number", type: "number" }]
      }
    ]
  }
];

let codeStartEnd = "```";

fields.forEach(field => {
  field.fields.push({
    key: field.key + "-info",
    type: "info",
    theme: "black-bare",
    content: `Sample code:

${codeStartEnd}
${JSON.stringify(field.fields, null, "  ")}
${codeStartEnd}
`
  });
});

export const nestTest: FormCookbookSample = {
  key: "nest-test",
  title: "Nest Test",
  description: "Nest test.",
  fields,
  values: {}
};
