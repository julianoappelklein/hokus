import React from "react";

class IconButtonGroup extends React.Component<any, {}> {
  render() {
    let { iconButtons, style } = this.props;
    if (iconButtons === undefined || iconButtons.length === 0) return null;

    let iconButtonsClones = iconButtons.map((b: any, key: any) => {
      let element = React.cloneElement(b, { key, iconStyle: { width: 18, height: 18 } });
      if (this.props.vertical === true) return <div key={key}>{element}</div>;
      return element;
    });

    return <div style={style}>{iconButtonsClones}</div>;
  }
}

export default IconButtonGroup;
