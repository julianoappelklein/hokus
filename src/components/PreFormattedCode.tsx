
import * as React from 'react';

export const PreFormatedCode = React.memo((props: { children: string }) =>{
    return (<pre style={{ padding: 16, margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word", border: 'solid 1px rgb(232, 232, 232)' }}>{props.children}</pre>);
});