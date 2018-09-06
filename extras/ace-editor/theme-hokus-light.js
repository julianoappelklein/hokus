ace.define("ace/theme/hokus-light",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-hokus-light";
exports.cssText = "\
.ace-hokus-light .ace_gutter {\
background: #e8e8e8;\
color: #AAA;\
}\
.ace-hokus-light .ace_gutter-cell  {\
color: #009ddc;\
}\
.ace-hokus-light  {\
background: #fff;\
color: #000;\
}\
.ace-hokus-light .ace_keyword {\
font-weight: bold;\
}\
.ace-hokus-light .ace_string {\
color: #D14;\
}\
.ace-hokus-light .ace_variable.ace_class {\
color: teal;\
}\
.ace-hokus-light .ace_constant.ace_numeric {\
color: #099;\
}\
.ace-hokus-light .ace_constant.ace_buildin {\
color: #0086B3;\
}\
.ace-hokus-light .ace_support.ace_function {\
color: #0086B3;\
}\
.ace-hokus-light .ace_comment {\
color: #998;\
font-style: italic;\
}\
.ace-hokus-light .ace_variable.ace_language  {\
color: #0086B3;\
}\
.ace-hokus-light .ace_paren {\
font-weight: bold;\
}\
.ace-hokus-light .ace_boolean {\
font-weight: bold;\
}\
.ace-hokus-light .ace_string.ace_regexp {\
color: #009926;\
font-weight: normal;\
}\
.ace-hokus-light .ace_variable.ace_instance {\
color: teal;\
}\
.ace-hokus-light .ace_constant.ace_language {\
font-weight: bold;\
}\
.ace-hokus-light .ace_cursor {\
color: black;\
}\
.ace-hokus-light.ace_focus .ace_marker-layer .ace_active-line {\
background: rgb(255, 255, 204);\
}\
.ace-hokus-light .ace_marker-layer .ace_active-line {\
background: rgb(245, 245, 245);\
}\
.ace-hokus-light .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-hokus-light.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px white;\
}\
.ace-hokus-light.ace_nobold .ace_line > span {\
font-weight: normal !important;\
}\
.ace-hokus-light .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-hokus-light .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-hokus-light .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-hokus-light .ace_gutter-active-line {\
background-color : rgba(0, 0, 0, 0.07);\
}\
.ace-hokus-light .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-hokus-light .ace_invisible {\
color: #BFBFBF\
}\
.ace-hokus-light .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-hokus-light .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}";

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
