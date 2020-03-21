import { FormCookbookSample } from "./types";

let fields: Array<any> = [
  {
    key: "accordion-section",
    title: "Accordion",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "accordion",
        title: "accordion",
        type: "accordion",
        itemTitleKey: "title",
        fields: [
          { key: "title", title: "Title", type: "string" },
          { key: "boolean", title: "Boolean", type: "boolean" }
        ]
      },
      {
        key: "accordion-with-validated-child",
        title: "accordion-with-validated-child",
        type: "accordion",
        itemTitleKey: "title",
        fields: [
          { key: "title", title: "Title", type: "string", required: true },
          { key: "boolean", title: "Boolean", type: "boolean" }
        ]
      }
    ]
  },
  {
    key: "boolean-section",
    title: "Boolean",
    type: "section",
    groupdata: false,
    fields: [{ key: "boolean", title: "boolean", type: "boolean" }]
  },
  {
    key: "bundle-manager-section",
    title: "Bundle Manager",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "bundle-manager-images",
        title: "Bundle Manager: Images",
        type: "bundle-manager",
        path: "images",
        extensions: ["png", "jpg", "jpeg"],
        fields: [
          { key: "title", title: "Title", type: "string", required: true },
          { key: "featured", title: "Featured", type: "boolean" },
          { key: "thumb", title: "Thubmanil", type: "bundle-image-thumbnail" }
        ]
      },
      {
        key: "bundle-manager-docs",
        title: "Bundle Manager: Documents",
        type: "bundle-manager",
        path: "docs",
        extensions: ["txt", "docx", "ttf", "html"],
        fields: [{ key: "featured", title: "Featured", type: "boolean" }]
      }
    ]
  },
  {
    key: "chips-section",
    title: "Chips",
    type: "section",
    groupdata: false,
    fields: [{ key: "chips", title: "Chips", type: "chips" }]
  },
  {
    key: "code-editor-section",
    title: "Code Editor",
    type: "section",
    groupdata: false,
    fields: [
      { key: "code-editor-html", title: "Code Editor HTML", type: "code-editor", lightTheme: true, language: "html" },
      { key: "code-editor-markdown", title: "Code Editor Markdown", type: "code-editor", language: "markdown" }
    ]
  },
  {
    key: "date-section",
    title: "Date",
    type: "section",
    groupdata: false,
    fields: [{ key: "date", title: "Date", type: "date" }]
  },
  {
    key: "hidden-section",
    title: "Hidden (don't expect a visible content)",
    type: "section",
    groupdata: false,
    fields: [{ key: "hidden", default: "hidden-default-value", type: "hidden" }]
  },
  {
    key: "leaf-array-section",
    title: "Leaf Array",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "leaf-array",
        type: "leaf-array",
        field: {
          key: "date",
          title: "Date",
          type: "date"
        }
      }
    ]
  },
  {
    key: "markdown-section",
    title: "Markdown",
    type: "section",
    groupdata: false,
    fields: [
      { key: "markdown", title: "Markdown", type: "markdown", multiLine: false },
      { key: "markdown-multiline", title: "Markdown MultiLine", type: "markdown", multiLine: true }
    ]
  },
  {
    key: "nest-section",
    title: "Nest",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "nest",
        title: "Nest",
        type: "nest",
        groupdata: true,
        fields: [{ key: "number", title: "Nested Number", type: "number" }]
      }
    ]
  },
  {
    key: "number-section",
    title: "Number",
    type: "section",
    groupdata: false,
    fields: [{ key: "number", title: "Number", type: "number" }]
  },
  {
    key: "readonly-section",
    title: "Readonly",
    type: "section",
    groupdata: false,
    fields: [{ key: "readonly", title: "Readonly", type: "readonly" }]
  },
  {
    key: "section-section",
    title: "Section",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "section",
        title: "Section",
        type: "section",
        groupdata: true,
        fields: [{ key: "number", title: "Number Inside Section", type: "number" }]
      }
    ]
  },
  {
    key: "select-section",
    title: "Select",
    type: "section",
    groupdata: false,
    fields: [
      {
        key: "select",
        title: "Select",
        type: "select",
        options: [1, 2, 3, 4, 5].map(v => ({ text: `Option ${v}`, value: v.toString() }))
      },
      {
        key: "select-multiple",
        title: "Select Multiple",
        type: "select",
        multiple: true,
        options: [1, 2, 3, 4, 5].map(v => ({ text: `Option ${v}`, value: v.toString() }))
      }
    ]
  },
  {
    key: "string-section",
    title: "String",
    type: "section",
    groupdata: false,
    fields: [
      { key: "string", title: "String", type: "string" },
      { key: "string-multiLine", title: "String MultiLine", type: "string", multiLine: true },
      { key: "string-required", title: "String Required", type: "string", required: true }
    ]
  }
];

let codeStartEnd = "```";

fields.forEach(field => {
  field.fields?.push({
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

export const allComponents: FormCookbookSample = {
  key: "all-components",
  title: "All Components",
  description: "All componentes, ordered alphabetically.",
  fields,
  values: {
    readonly: "You can't change this.",
    nest: {}
  }
};
