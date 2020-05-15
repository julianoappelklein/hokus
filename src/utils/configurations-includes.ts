export const formConfigurationsIncludes = {
  fieldsAccordionInclude: [
    {
      key: "fields",
      type: "accordion",
      title: "fields",
      itemTitleKey: "key",
      fields: [{ key: "anyFieldInclude", type: "include", include: "anyFieldInclude" }]
    }
  ],
  anyFieldInclude: [
    { key: "baseFieldInclude", type: "include", include: "baseFieldInclude" },
    {
      key: "type",
      title: "type",
      type: "select",
      options: [
        { value: "accordion" },
        { value: "boolean" },
        { value: "bundle-manager" },
        { value: "bundle-image-thumbnail" },
        { value: "chips" },
        { value: "code-editor" },
        { value: "data-nest" },
        { value: "date" },
        { value: "empty-line" },
        { value: "extend" },
        { value: "hidden" },
        { value: "info" },
        { value: "markdown" },
        { value: "nest" },
        { value: "number" },
        { value: "readonly" },
        { value: "section" },
        { value: "select" },
        { value: "string" }
      ],
      default: "string",
      required: true
    },
    {
      key: "typeExtend",
      type: "extend",
      nest: false,
      groupdata: false,
      selectorKey: "type",
      fields: [],
      clearExcept: ["key"],
      types: [
        { key: "accordion", fields: [{ key: "accordionInclude", type: "include", include: "accordionInclude" }] },
        { key: "boolean", fields: [{ key: "booleanInclude", type: "include", include: "booleanInclude" }] },
        {
          key: "bundle-manager",
          fields: [{ key: "bundleManagerInclude", type: "include", include: "bundleManagerInclude" }]
        },
        {
          key: "bundle-image-thumbnail",
          fields: [{ key: "bundleImageThumbnailInclude", type: "include", include: "bundleImageThumbnailInclude" }]
        },
        { key: "chips", fields: [{ key: "chipsInclude", type: "include", include: "chipsInclude" }] },
        {
          key: "code-editor",
          fields: [{ key: "codeEditorInclude", type: "include", include: "codeEditorInclude" }]
        },
        { key: "data-nest", fields: [{ key: "dataNestInclude", type: "include", include: "dataNestInclude" }] },
        { key: "date", fields: [{ key: "dateInclude", type: "include", include: "dateInclude" }] },
        { key: "empty-line", fields: [{ key: "emptyLineInclude", type: "include", include: "emptyLineInclude" }] },
        { key: "extend", fields: [{ key: "extendInclude", type: "include", include: "extendInclude" }] },
        { key: "hidden", fields: [{ key: "hiddenInclude", type: "include", include: "hiddenInclude" }] },
        { key: "info", fields: [{ key: "infoInclude", type: "include", include: "infoInclude" }] },
        { key: "markdown", fields: [{ key: "markdownInclude", type: "include", include: "markdownInclude" }] },
        { key: "number", fields: [{ key: "numberInclude", type: "include", include: "numberInclude" }] },
        { key: "nest", fields: [{ key: "nestInclude", type: "include", include: "nestInclude" }] },
        { key: "readonly", fields: [{ key: "readonlyInclude", type: "include", include: "readonlyInclude" }] },
        { key: "section", fields: [{ key: "sectionInclude", type: "include", include: "sectionInclude" }] },
        { key: "select", fields: [{ key: "selectInclude", type: "include", include: "selectInclude" }] },
        { key: "string", fields: [{ key: "textFieldInclude", type: "include", include: "textFieldInclude" }] }
      ]
    }
  ],
  baseFieldInclude: [{ key: "key", type: "string", title: "key", required: true }],
  accordionInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "itemTitleKey", title: "itemTitleKey", type: "chips" },
    { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
  ],
  booleanInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "default", title: "default", type: "boolean", default: false },
    { key: "tip", title: "tip", type: "string" }
  ],
  bundleManagerInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "path", title: "path", type: "string" },
    {
      key: "extensions",
      title: "extensions",
      type: "chips"
    },
    { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
  ],
  bundleImageThumbnailInclude: [{ key: "src", title: "src", type: "string", required: false }],
  chipsInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "default", title: "default", type: "chips" }
  ],
  codeEditorInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "language", title: "language", type: "string", required: false },
    { key: "default", title: "default", type: "string", multiLine: true, default: false },
    { key: "tip", title: "tip", type: "string" },
    { key: "lightTheme", title: "lightTheme", type: "boolean", default: true }
  ],
  dataNestInclude: [{ key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }],
  dateInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "required", title: "required", type: "boolean", default: true },
    { key: "default", title: "default", type: "date" },
    { key: "tip", title: "tip", type: "string" }
  ],
  emptyLineInclude: [{ key: "amount", title: "amount", type: "number" }],
  extendInclude: [
    { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" },
    // initialState?: { [key: string]: any };
    { key: "selectorKey", title: "selectorKey", type: "string", required: true },
    {
      key: "types",
      type: "accordion",
      title: "types",
      itemTitleKey: ["key"],
      fields: [
        { key: "key", title: "key", type: "string", required: true },
        { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
      ]
    },
    { key: "clearOnChange", title: "clearOnChange", type: "chips" },
    { key: "clearExcept", title: "clearExcept", type: "chips" }
  ],
  infoInclude: [
    { key: "content", title: "content", type: "markdown", multiLine: true },
    {
      key: "size",
      title: "size",
      type: "select",
      default: "default",
      options: [{ value: "small" }, { value: "default" }, { value: "large" }]
    },
    { key: "lineHeight", title: "lineHeight", type: "number", default: 1.2 },
    {
      key: "theme",
      title: "theme",
      type: "select",
      default: "default",
      options: [
        { value: "default" },
        { value: "bare" },
        { value: "warn" },
        { value: "warn-bare" },
        { value: "black" },
        { value: "black-bare" },
        { value: "gray" },
        { value: "gray-bare" }
      ]
    }
  ],
  hiddenInclude: [
    { key: "value", title: "value", type: "string", required: false },
    { key: "default", title: "default", type: "string", required: false }
  ],
  markdownInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "multiLine", title: "multiLine", type: "boolean", default: true },
    { key: "default", title: "default", type: "markdown", multiLine: true, default: false },
    { key: "tip", title: "tip", type: "string" }
  ],
  nestInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "groupdata", title: "groupdata", type: "boolean", default: false },
    { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
  ],
  numberInclude: [
    { key: "title", title: "title", type: "string", required: true },
    // { key: "required", title: "required", type: "boolean", default: false },
    { key: "default", title: "default", type: "number" },
    { key: "tip", title: "tip", type: "string" }
  ],
  readonlyInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "required", title: "required", type: "boolean", default: false },
    { key: "value", title: "default", type: "string" },
    { key: "default", title: "default", type: "string" },
    { key: "multiLine", title: "multiLine", type: "boolean", default: false },
    {
      key: "defaultExtend",
      type: "extend",
      selectorKey: "multiLine",
      clearOnChange: [],
      types: [
        {
          key: "true",
          fields: [{ key: "default", title: "default", type: "string", multiLine: true }]
        },
        {
          key: "false",
          fields: [{ key: "default", title: "default", type: "string" }]
        }
      ]
    },
    { key: "tip", title: "tip", type: "string" }
  ],
  textFieldInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "required", title: "required", type: "boolean", default: false },
    { key: "pattern", title: "pattern", type: "string", required: false },
    { key: "multiLine", title: "multiLine", type: "boolean", default: false },
    {
      key: "defaultExtend",
      type: "extend",
      selectorKey: "multiLine",
      clearOnChange: [],
      types: [
        {
          key: "true",
          fields: [{ key: "default", title: "default", type: "string", multiLine: true }]
        },
        {
          key: "false",
          fields: [{ key: "default", title: "default", type: "string" }]
        }
      ]
    },
    { key: "tip", title: "tip", type: "string" }
  ],
  sectionInclude: [
    { key: "title", title: "title", type: "string", required: true },
    { key: "groupdata", title: "groupdata", type: "boolean", default: false },
    { key: "fieldsAccordionInclude", type: "include", include: "fieldsAccordionInclude" }
  ],
  selectInclude: [
    { key: "title", title: "title", type: "string", required: true },
    {
      key: "options",
      title: "options",
      type: "accordion",
      itemTitleKey: "value",
      fields: [
        { key: "value", title: "value", type: "string" },
        { key: "text", title: "text", type: "string" }
      ]
    },
    { key: "multiple", title: "multiple", type: "boolean", default: false },
    { key: "required", title: "required", type: "boolean", default: false },
    {
      key: "multipleExtend",
      selectorKey: "multiple",
      type: "extend",
      clearOnChange: ["default"],
      types: [
        {
          key: "false",
          fields: [{ key: "default", title: "default", type: "string", default: "" }]
        },
        {
          key: "true",
          fields: [
            {
              key: "default",
              title: "default",
              type: "chips",
              default: []
            }
          ]
        }
      ]
    },
    { key: "tip", title: "tip", type: "string" }
  ]
};
