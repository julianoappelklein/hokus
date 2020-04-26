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
    var operations = blockingOperationService.getRunningBlockingOperations();

    return (
      <Dialog open={operations.length>0} modal={true}>
        <div style={{textAlign: 'center'}}>
          <Spinner margin="2rem auto" spins={6} />
          {operations.map(x => (<div>{x.title}</div>))}
        </div>
      </Dialog>
    );
  }
}
