import { FormCookbookSample } from "./types";

let fields: Array<any> = [
  {
    key: "accordion-grouped-section",
    title: "Accordion Grouped",
    type: "section",
    groupdata: true,
    fields: [
      {
        key: "accordion1",
        title: "Accordion1",
        type: "accordion",
        groupdata: true,
        fields: [{ key: "number1", title: "Accordioned Number", type: "number" }]
      },
      {
        key: "accordion2",
        title: "Accordion2",
        type: "accordion",
        groupdata: true,
        fields: [
          {
            key: "accordion3",
            title: "Accordion3",
            type: "accordion",
            groupdata: true,
            fields: [{ key: "number2", title: "Accordioned Number", type: "number" }]
          }
        ]
      }
    ]
  },
  {
    key: "accordion-ungrouped-section",
    title: "Accordion Ungrouped",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "accordion4",
        title: "Accordion4",
        type: "accordion",
        groupdata: true,
        fields: [{ key: "number3", title: "Accordioned Number", type: "number" }]
      },
      {
        key: "accordion5",
        title: "Accordion5",
        type: "accordion",
        groupdata: true,
        fields: [
          {
            key: "accordion6",
            title: "Accordion6",
            type: "accordion",
            groupdata: true,
            fields: [{ key: "number4", title: "Accordioned Number", type: "number" }]
          }
        ]
      }
    ]
  },
  {
    key: "accordion7",
    title: "Accordion7",
    type: "accordion",
    groupdata: true,
    fields: [{ key: "number5", title: "Accordioned Number", type: "number" }]
  },
  {
    key: "accordion8",
    title: "Accordion8",
    type: "accordion",
    groupdata: true,
    fields: [
      {
        key: "accordion9",
        title: "Accordion9",
        type: "accordion",
        groupdata: true,
        fields: [{ key: "number6", title: "Accordioned Number", type: "number" }]
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

export const accordionTest: FormCookbookSample = {
  key: "accordion-test",
  title: "Accordion Test",
  description: "Accordion test.",
  fields,
  values: {}
};
