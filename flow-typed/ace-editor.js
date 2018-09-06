export type AceEditor$Options = {
  //editor
  selectionStyle?: 'line'|'text',
  highlightActiveLine?: bool,
  highlightSelectedWord?: bool,
  readOnly?: bool,
  cursorStyle?: 'ace'|'slim'|'smooth'|'wide',
  mergeUndoDeltas?: bool|'always',
  behavioursEnabled?: bool,
  wrapBehavioursEnabled?: bool, // this is needed if editor is inside scrollable page
  autoScrollEditorIntoView?: bool, // copy/cut the full line if selection is empty, defaults to false
  copyWithEmptySelection?: bool, 
  useSoftTabs?: bool,
  navigateWithinSoftTabs?: bool,
  //renderer
  hScrollBarAlwaysVisible?: bool,
  vScrollBarAlwaysVisible?: bool,
  highlightGutterLine?: bool,
  animatedScroll?: bool,
  showInvisibles?: bool,
  showPrintMargin?: bool,
  printMarginColumn?: number, // shortcut for showPrintMargin and printMarginColumn
  printMargin?: false|number,
  fadeFoldWidgets?: bool,
  showFoldWidgets?: bool,
  showLineNumbers?: bool,
  showGutter?: bool,
  displayIndentGuides?: bool,
  fontSize?: number|string,
  fontFamily?: string, // resize editor based on the contents of the editor until the number of lines reaches maxLines
  maxLines?: number,
  minLines?: number, // number of page sizes to scroll after document end (typical values are 0, 0.5, and 1)
  scrollPastEnd?: number|bool,
  fixedWidthGutter?: bool,
  theme?: string,
  //mouseHandler
  scrollSpeed?: number,
  dragDelay?:  number,
  dragEnabled?: bool,
  focusTimout?: number,
  tooltipFollowsMouse?: bool,
  //session
  firstLineNumber?: number,
  overwrite?: bool,
  newLineMode?: 'auto'|'unix'|'windows',
  useWorker?: bool,
  useSoftTabs?: bool,
  tabSize?: number,
  wrap?: bool|number,
  foldStyle?: 'markbegin'|'markbeginend'|'manual',
  mode?: string,
  //extensions
  enableMultiselect?: bool,
  enableEmmet?: bool,
  enableBasicAutocompletion?: bool,
  enableLiveAutocompletion?: bool,
  enableSnippets?: bool,
  spellcheck?: bool,
  useElasticTabstops?: bool
}

export type AceEditor$Editor = {
  on: (evt: 'blur'|'change'|'focus'|'paste', handler: Function) => void,
  destroy: () => void,
  resize: () => void,
  setOptions: (options: AceEditor$Options) => void,
  getSession: () => {
    on: (evt: string, handler: Function) => void
  },
  getCursorPosition: ()=>{ row: number, column: index },
  getValue: () => string,
  setValue: (value: string) => void,
  focus: ()=>void,
  selection: {
    toJSON: ()=>string,
    fromJSON: (string)=>void
  },
  moveCursorTo:(row: number, column: number) => void,
  moveCursorToPosition: (position: { row: number, column: index }) => void,
  gotoLine: (line: number, column: number, animate: bool) => void,
  scrollToLine: (line: number, center: bool, animate: bool, callback: Function) => void
};

declare var ace: {
  edit: (target :HTMLElement|string) => AceEditor$Editor
};