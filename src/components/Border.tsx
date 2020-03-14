import React, { CSSProperties } from "react";

const Border: React.FC<{ style: CSSProperties }> = ({ style, children }) => {
  return <div style={Object.assign({ border: "solid 1px #e8e8e8", borderRadius: "7px" }, style)}>{children}</div>;
};

export default Border;
