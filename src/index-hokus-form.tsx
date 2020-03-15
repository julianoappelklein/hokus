/***
    This is an alternate index.js file.
    It only exists to make the FormsCookbook to be usable as a standalone app.
    To build it, you'll have to swap the default index before calling "npm run _react-build".
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import { FormsCookbook } from './containers/FormsCookbook/FormsCookbook';
import { samples } from './containers/FormsCookbook/samples';

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MenuItem, SelectField } from 'material-ui';
import logo from './img/logo.svg';

//STYLE STUFF
import './css/index.css';
import './css/bootstrap-grid.css';

let samplesExt = [{key:'none', title:'Introduction', description: '', values: {}, fields: [
    { type:"info", lineHeight:'1.4', theme:'black-bare', content:`

# Welcome to Hokus Forms Cookbook!

This UI was crated as a part of Hokus CMS, a CMS for Hugo. It only covers the forms creation process, abstracting away other concepts from the CMS.

I decided to extract it to the web having two purposes in mind:

1. To quickly show how powerfull is the engine behing the form construction process from Hokus CMS.
2. To give practical samples to serve as documentation for those who are learning to create their own forms.

With Hokus, is very easy to create performatic forms that supports complex hierarchies. There are no nesting limits!  

All you have to do is to create simple configuration files.

Once ready, you can bind these forms to collections of documents or to single files (be it data files or front-matters).

## About The UI To Explore The Samples

**To switch between samples**, use the dropdown at the top.

In the bottom right corner, there are buttons to access **the current form state** and **the configurations used to build the current form**.

Note 1: This very page is built using the engine. We are using the componente "info" to render markdown as HTML. The component does not have a state.
Note 2: Although the samples are using **JSON**, Hokus also supports **YAML** and **TOML**.

## Request Your Sample

I accept the challange to port your document data structure to Hokus Forms.

To throw me a challenge, just create an issue: [https://github.com/julianoappelklein/hokus/issues](https://github.com/julianoappelklein/hokus/issues)

For more informations, access our website [https://hokus.netlify.com](https://hokus.netlify.com) or our repository: [https://github.com/julianoappelklein/hokus](https://github.com/julianoappelklein/hokus).

If you have any doubts, please, reach me by using the website contact form or from our repo.

*Juliano Appel Klein*  
*Hokus Author*



` }
]}].concat(samples);

const Container = (props:any)=>{
    return <div style={{margin: '0px auto', maxWidth:'50em', padding:'0 0.5em'}}>{props.children}</div>
}

class FormsCookbookWeb extends React.Component<any,any>{
    
    constructor(props: any){
        super(props);
        this.state = {index:0};
    }

    handleChange = (e: any, index: number)=>{
        this.setState({index});
    }

    render(){
        return (
            <React.Fragment>
                <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                    <div style={{width:'100%', position:'fixed', background: '#16062f',zIndex:10}}>
                        <Container>
                            <div style={{padding: '20px 20px 0 20px'}}>
                                <img src={logo} className="App-logo" alt="logo" style={{maxWidth:32}}  />
                                <SelectField
                                    style={{margin:'10px 0', padding:0 }} labelStyle={{color:'RGBA(255,255,255,.85)'}}
                                    fullWidth value={this.state.index} onChange={this.handleChange}>
                                    { samplesExt.map((x,i) => <MenuItem key={x.key} value={i} primaryText={x.title} />) }
                                </SelectField>
                            </div>
                        </Container>
                    </div>
                </MuiThemeProvider>
                <div style={{height:130}}></div>
                <Container>
                    <FormsCookbook samples={samplesExt} sampleKey={samplesExt[this.state.index].key} />
                </Container>
            </React.Fragment>
        );
    }
}

ReactDOM.render(
    <BrowserRouter>
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <FormsCookbookWeb />
        </MuiThemeProvider>
    </BrowserRouter>,
    document.getElementById('root')
);