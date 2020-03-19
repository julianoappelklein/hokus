import * as React from "react";

export const FormItem = (props: any) => {
  const { style, ...others } = props || {};
  return <div style={{ marginTop: "12px", marginBottom: "12px", ...props.style }} {...others}></div>;
};
