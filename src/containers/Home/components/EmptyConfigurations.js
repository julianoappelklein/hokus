//@flow

import * as React from 'react';
import { Wrapper, MessageBlock } from './shared';
import { Paper } from 'material-ui';
import type { Configurations } from './../../../types';


export default function EmptyConfigurations(props: {configurations: Configurations}){
    
    const { configurations } = props;

    return <Wrapper title="Site Management">
        <div class="row">
            <div class="col-xl-5 col-lg-8 col-md-12">
                <MessageBlock>Looks like your configuration is empty.</MessageBlock>
                <MessageBlock>We are looking for files matching the following glob patterns:<br />
                    
                    <ul>{
                        /*$FlowFixMe*/
                        configurations.fileSearchPatterns.map((pattern)=><li><b>{pattern}</b></li>)
                    }</ul>
                </MessageBlock>
                <MessageBlock>
                    You can copy and paste the minimal configuration from the box below into a new file.
                    Just don't forget to replace the properties <b>key, name and path</b>.
                    Note that you can have multiple configuration files, each containing one or more sites. Just use the patterns displayed above.
                </MessageBlock>
                <MessageBlock>
                    <Paper style={{padding:16}}>
                    <pre>{JSON.stringify({
"sites":
[
    {
        "name": "{AWESOME_SITE_NAME}",
        "key": "{AWESOME_SITE_UNIQUE_KEY}",
        "source": {        
            "type": "folder",
            "path": "{FULL_PATH_TO_SITE_ROOT}"
        }
    }
]
}, null, '  ')}</pre>
                    </Paper>
                </MessageBlock>
                <MessageBlock>
                    After creating your files, you need to restart the application 
                    (look for a hidden icon at the bottom left corner of this window).
                </MessageBlock>
            </div>
        </div>
    </Wrapper>;
}