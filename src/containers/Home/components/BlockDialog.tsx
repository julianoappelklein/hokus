import * as React from 'react';
import { Dialog } from 'material-ui';

type BlockDialogProps = {
    open: boolean,
    children: React.ReactNode
}

export default class BlockDialog extends React.Component<BlockDialogProps,any>{
    
    render(){

        let { open, children } = this.props;

        return (
            <Dialog
                title="Working..."
                open={open}
            >
                {children}
            </Dialog>
        );
    }

}