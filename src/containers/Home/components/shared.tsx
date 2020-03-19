import * as React from "react";
import { Subheader } from "material-ui";

export const Wrapper = ({ title, style, children }: { title?: string; style?: any; children?: any } = {}) => {
  return (
    <React.Fragment>
      {title ? <Subheader>{title}</Subheader> : undefined}
      <div style={Object.assign({ padding: "16px 0", paddingTop: title ? "0px" : "16px" }, style)}>{children}</div>
    </React.Fragment>
  );
};

export const InfoLine = ({
  label,
  children,
  childrenWrapperStyle
}: {
  label: string;
  children: any;
  childrenWrapperStyle?: any;
}) => {
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: "12px", lineHeight: "16px" }}>{label}</div>
      <div style={childrenWrapperStyle}>{children}</div>
    </div>
  );
};

export const InfoBlock = ({ label, children }: { label: string; children: any }) => {
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ fontSize: "12px", lineHeight: "16px", padding: "0 16px 4px 16px" }}>{label}</div>
      <div>{children}</div>
    </div>
  );
};

export const MessageBlock = ({ children }: { children: any }) => {
  return <div style={{ padding: "16px" }}>{children}</div>;
};
