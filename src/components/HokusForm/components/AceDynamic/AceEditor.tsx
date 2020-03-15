import React from "react";

export let editorBackgroundColor = "#f3f3f3";

class Debounce {
  _time: number;
  _timeoutID: any;

  constructor(time: number) {
    this._time = time;
  }

  run(action: () => void) {
    this.cancelNext();
    this._timeoutID = setTimeout(action, this._time);
  }

  cancelNext() {
    if (this._timeoutID) clearTimeout(this._timeoutID);
  }
}

type EditorStateSnapshot = {
  cursor: { row: number; column: number };
  selection: any;
};

type AceEditorProps = {
  value: string;
  editorState: EditorStateSnapshot | null | undefined;
  onChange: (value: string) => void;
  language: string;
  isFullScreenMode: boolean;
  lightTheme: boolean;
  onStateSnapshotEmit: (editorState: EditorStateSnapshot) => void;
};

type AceEditorState = {};

export class AceEditor extends React.Component<AceEditorProps, AceEditorState> {
  _aceContainer: HTMLElement | null | undefined;
  _onDocumentResizeListener: () => void = () => {};
  _editor?: AceAjax.Editor;
  _relayoutDebounce: Debounce;

  constructor(props: AceEditorProps) {
    super(props);
    this._relayoutDebounce = new Debounce(200);
    this.state = { scrollTop: 0 };
  }

  refreshEditorLayout() {
    if (this._editor) {
      this._editor.resize();
    }
  }

  emitEditorStateSnapshot() {
    if (!this._editor) return;
    let data = {
      cursor: this._editor.getCursorPosition(),
      // @ts-ignore
      selection: this._editor.selection.toJSON()
    };
    let snapshot = JSON.parse(JSON.stringify(data)) as EditorStateSnapshot;
    this.props.onStateSnapshotEmit(snapshot);
  }

  componentWillUnmount() {
    if (this._onDocumentResizeListener) window.removeEventListener("onresize", this._onDocumentResizeListener);
    if (this._editor) this._editor.destroy();
  }

  componentDidUpdate(prevProps: AceEditorProps, prevState: AceEditorState, snapshot: any) {
    this.refreshEditorLayout();
  }

  componentDidMount() {
    if (this._aceContainer != null) {
      let options: any = {
        mode: this.props.language === "html" ? "ace/mode/html" : "ace/mode/markdown",
        theme: this.props.lightTheme ? "ace/theme/hokus-light" : "ace/theme/hokus",
        fontFamily: "Roboto Mono",
        fontSize: "15px",
        wrap: true,
        useWorker: true,
        scrollPastEnd: true,
        showPrintMargin: false
      };
      this._editor = ace.edit(this._aceContainer); // eslint-disable-line
      this._editor.setValue(this.props.value || "");
      this._editor.setOptions(options);

      this._editor.on("change", () => {
        if (this._editor) {
          this.props.onChange(this._editor.getValue());
        }
      });

      this._editor.on("blur", () => {
        this.emitEditorStateSnapshot();
      });

      this._onDocumentResizeListener = () => {
        this._relayoutDebounce.run(() => {
          this.refreshEditorLayout();
        });
      };

      if (this.props.editorState) {
        let { cursor, selection } = this.props.editorState;
        console.log(this.props.editorState);
        if (cursor) this._editor.moveCursorTo(cursor.row, cursor.column);
        // @ts-ignore
        if (selection) this._editor.selection.fromJSON(selection);
      } else {
        this._editor.moveCursorTo(0, 0);
        // @ts-ignore
        this._editor.selection.fromJSON("");
      }

      window.addEventListener("resize", this._onDocumentResizeListener);
    }
  }

  render() {
    return (
      <div
        style={{ height: "100%" }}
        ref={ref => {
          this._aceContainer = ref;
        }}
      ></div>
    );
  }
}
