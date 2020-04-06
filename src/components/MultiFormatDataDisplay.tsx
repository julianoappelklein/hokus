import * as React from "react";
import { Tab, Tabs } from "material-ui";
import { PreFormatedCode } from "./PreFormattedCode";
const tomlify = require("tomlify-j0.4");
const jsYaml = require("js-yaml");

export const MultiFormatDataDisplay = React.memo((props: { data: any }) => {
  const [format, setFormat] = React.useState("yaml");

  return (
    <Tabs value={format} onChange={(value: string) => setFormat(value)}>
      <Tab label="YAML" value="yaml">
        {format === "yaml" && <PreFormatedCode>{jsYaml.dump(props.data)}</PreFormatedCode>}
      </Tab>
      <Tab label="TOML" value="toml">
        {format === "toml" && <PreFormatedCode>{tomlify.toToml(props.data, { space: 2 })}</PreFormatedCode>}
      </Tab>
      <Tab label="JSON" value="json">
        {format === "json" && <PreFormatedCode>{JSON.stringify(props.data, null, "  ")}</PreFormatedCode>}
      </Tab>
    </Tabs>
  );
});
