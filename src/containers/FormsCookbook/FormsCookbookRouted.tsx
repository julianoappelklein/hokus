import * as React from "react";
import { Route, Switch } from "react-router";
import { FormsCookbook } from "./FormsCookbook";
import { FormsBuilder } from "./FormsBuilder/FormsBuilder";

interface Props {}

interface State {}

export class FormsCookbookRouted extends React.Component<Props, State> {
  render() {
    return (
      <Switch>
        <Route
          path={"/forms-cookbook/builder"}
          render={({ history, match }) => {
            return <FormsBuilder />;
          }}
        />
        <Route
          path={"/forms-cookbook/:sampleKey"}
          render={({ history, match }) => {
            return <FormsCookbook sampleKey={match.params.sampleKey} />;
          }}
        />
      </Switch>
    );
  }
}
