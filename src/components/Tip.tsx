import React, { Component } from "react";
import IconButton from "material-ui/IconButton";
import IconHelp from "material-ui/svg-icons/action/info-outline";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true });

type TipProps = {
  markdown: string;
  toggle?: any;
  horizontalAlign?: "left" | "right" | null;
};

type TipState = {
  offsetY: number;
  offsetX: number;
  visible: boolean;
};

class Tip extends Component<TipProps, TipState> {
  toggleRef?: any;
  closeTipAndUnbind: () => void;
  closeTimeout: any;

  constructor(props: TipProps) {
    super(props);
    this.state = {
      offsetY: 0,
      offsetX: 0,
      visible: false
    };

    this.closeTipAndUnbind = () => {
      this.setState({ visible: false });
      document.removeEventListener("click", this.closeTipAndUnbind);
    };
  }

  handleClick(e: any) {
    e.preventDefault();
    if (this.closeTimeout) clearTimeout(this.closeTimeout);

    this.setState({ visible: true });
    document.addEventListener("click", this.closeTipAndUnbind);
  }

  handleMouseEnter(e: any) {
    if (this.closeTimeout) clearTimeout(this.closeTimeout);

    if (!this.state.visible) {
      this.setState({ visible: true });
    }
  }

  handleMouseLeave(e: any) {
    if (this.closeTimeout) clearTimeout(this.closeTimeout);

    this.closeTimeout = setTimeout(() => {
      if (this.state.visible) {
        this.closeTipAndUnbind();
      }
    }, 100);
  }

  render() {
    let { markdown = "Write a **markdown** tip!", toggle } = this.props;

    let tip = undefined;
    let alignLeft = (this.props.horizontalAlign || "left") == "left";

    if (markdown) {
      let tipContainerStyle: any = {
        position: "absolute",
        width: "50vw", //this works as the max with
        display: this.state.visible ? "block" : "none"
      };

      let tipContentStyle: any = {
        position: "absolute",
        minWidth: "0px",
        textAlign: "center",
        border: "solid 1px black",
        zIndex: 5,
        fontSize: "80%",
        padding: "0.3em 0.9em",
        background: "#16062f",
        color: "white",
        borderRadius: "3px"
      };
      if (alignLeft) {
        tipContainerStyle.right = 0;
        tipContentStyle.right = 0;
      } else {
        tipContainerStyle.left = 0;
        tipContentStyle.left = 0;
      }

      tip = (
        <div style={tipContainerStyle}>
          <div
            className={this.state.visible ? "fadeIn animated-fast" : ""}
            style={tipContentStyle}
            onMouseLeave={this.handleMouseLeave.bind(this)}
            onMouseEnter={this.handleMouseEnter.bind(this)}
            dangerouslySetInnerHTML={{ __html: md.render(markdown) }}
          ></div>
        </div>
      );
    }

    if (toggle === undefined) {
      toggle = (
        <IconButton
          iconStyle={{ width: 18, height: 18 }}
          ref={toggle => {
            if (toggle) {
              this.toggleRef = toggle;
            }
          }}
          onClick={this.handleClick.bind(this)}
          onMouseLeave={this.handleMouseLeave.bind(this)}
          onMouseEnter={this.handleMouseEnter.bind(this)}
        >
          <IconHelp />
        </IconButton>
      );
    } else {
      toggle = React.cloneElement(toggle, {
        ref: (toggle?: HTMLElement) => {
          this.toggleRef = toggle;
        },
        onClick: this.handleClick.bind(this)
      });
    }

    return (
      <span style={{ display: "inline-block", position: "relative", cursor: "default" }}>
        {tip}
        {toggle}
      </span>
    );
  }
}

export default Tip;
