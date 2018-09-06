//@flow

import * as React from 'react';
import { Route } from 'react-router';
import { Sidebar } from './../Sidebar';
import type { SidebarMenu } from './../Sidebar';
import { samples } from './samples'

type FormsCookbookSidebarProps = {
    menuIsLocked: bool,
    onLockMenuClicked: ()=> void,
    onToggleItemVisibility: ()=> void,
    hideItems : bool
};

type FormsCookbookSidebarState = {
    
}

export class FormsCookbookSidebar extends React.Component<FormsCookbookSidebarProps, FormsCookbookSidebarState>{

    render(){
        return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
    }

    renderWithRoute(history: {push:(path: string)=>void}){

        let menu: SidebarMenu = {
            title: 'Forms Cookbook',
            items: samples.map((sample)=>{
                return {
                    active: false,
                    label: sample.title,
                    onClick: ()=>{
                        history.push('/forms-cookbook/'+sample.key)
                    }
                }
            })
        }

        return <Sidebar {...this.props} menus={[menu]} />
    }
}