import * as React from "react";
import { Dialog } from "material-ui";
import Spinner from "./Spinner";
import { blockingOperationService } from "../services/ui-service";

export default class BlockDialog extends React.Component<{}, {}> {
  componentDidMount() {
    blockingOperationService.registerListener(this);
  }

  componentWillUnmount() {
    blockingOperationService.registerListener(this);
  }

  render() {
    const operations = blockingOperationService.getRunningBlockingOperations();

    return (
      <Dialog contentStyle={{ maxWidth: "600px" }} open={operations.length > 0} modal={true}>
        <div style={{ textAlign: "center" }}>
          <Spinner margin="2rem auto" spins={6} />
          {operations.map(x => (
            <div key={x.key}>{x.title}</div>
          ))}
        </div>
      </Dialog>
    );
  }
}
