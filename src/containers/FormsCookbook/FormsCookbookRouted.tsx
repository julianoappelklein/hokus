import * as React from "react";
import { Route } from "react-router";
import { FormsCookbook } from "./FormsCookbook";

interface Props {}

interface State {}

export class FormsCookbookRouted extends React.Component<Props, State> {
  render() {
    return (
      <Route
        path={"/forms-cookbook/:sampleKey"}
        render={({ history, match }) => {
          return <FormsCookbook sampleKey={match.params.sampleKey} />;
        }}
      />
    );
  }
}
