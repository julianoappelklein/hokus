import * as React from "react";
import DefaultWrapper from "./shared/DefaultWrapper";
import { BaseDynamic } from "../../HoForm";
import MarkdownIt from "markdown-it";
import { CSSProperties } from "react";
const md = new MarkdownIt({ html: true });

const infoStyles: { [k: string]: CSSProperties } = {
  default: { border: "1px solid #00bcdc", borderLeftWidth: "5px", color: "#34749a" },
  bare: { color: "#34749a", padding: 0 },
  warn: { border: "1px solid rgb(220, 142, 0)", borderLeftWidth: "5px", color: "#6f481f" },
  "warn-bare": { color: "#6f481f", padding: 0 },
  black: { border: "1px solid #000", borderLeftWidth: "5px", color: "#000" },
  "black-bare": { color: "#000", padding: 0 },
  gray: { border: "1px solid #ccc", borderLeftWidth: "5px", color: "#aaa" },
  "gray-bare": { color: "#aaa", padding: 0 }
};

const infoSizeStyles: { [k: string]: CSSProperties } = {
  default: {},
  small: { fontSize: "85%" },
  large: { fontSize: "110%" }
};

type InfoDynamicField = {
  type: string;
  key: string;
  content: string;
  size: "small" | "large";
  lineHeight: string;
  theme: "default" | "bare" | "warn" | "warn-bare" | "black" | "black-bare" | "gray" | "gray-bare";
};

type InfoDynamicState = {};

class InfoDynamic extends BaseDynamic<InfoDynamicField, InfoDynamicState> {
  normalizeState({ state, field }: { state: any; field: InfoDynamicField }) {}

  getType() {
    return "info";
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, parentPath } = context;
    let { field } = node;

    if (!parentPath.startsWith(currentPath)) {
      return null;
    }

    let style = { padding: "10px 20px", borderRadius: "2px", lineHeight: field.lineHeight };

    let infoStyle = infoStyles["default"];
    if (field.theme && infoStyles[field.theme]) infoStyle = infoStyles[field.theme];

    let infoSizeStyle = infoSizeStyles["default"];
    if (field.size && infoSizeStyles[field.size]) infoSizeStyle = Object.assign(style, infoSizeStyles[field.size]);

    style = Object.assign({}, style, infoStyle, infoSizeStyle);

    return (
      <DefaultWrapper key={field.key}>
        <div style={style} dangerouslySetInnerHTML={{ __html: md.render(field.content || "") }}></div>
      </DefaultWrapper>
    );
  }
}

export default InfoDynamic;
