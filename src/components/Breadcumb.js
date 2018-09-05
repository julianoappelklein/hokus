import React from 'react';
import Border from './Border';
import FlatButton from 'material-ui/FlatButton';
import IconChevronRight from 'material-ui/svg-icons/navigation/chevron-right';

class Breadcumb extends React.Component{
    render(){
        
        let items = this.props.items;
        let newItems = [];
        
        for(let i = 0; i < items.length; i++){
            if(i > 0){
                newItems.push(<FlatButton
                    key={'breadcumb-item-arrow-'+i}
                    disabled={true}
                    icon={<IconChevronRight />}
                    style={{minWidth:'30px'}} />)
            }
            
            newItems.push(React.cloneElement(items[i], {key:'breadcumb-item-'+i}));
        }

        return (
            <Border style={Object.assign({borderRadius:'2px'}, this.props.style)}>
                {newItems}
            </Border>
        );
    }
}

class BreadcumbItem extends React.Component{
    render(){
        return (<FlatButton
            primary={true}
            style={{minWidth:'30px', borderRadius:'0px'}}
            disabled={this.props.disabled}
            label={this.props.label}
            onClick={this.props.onClick} />);
    }
}

export { Breadcumb, BreadcumbItem };