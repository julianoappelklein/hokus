ace.define("ace/theme/hokus",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-hokus";
exports.cssText = ".ace-hokus .ace_gutter {\
background: RGBA(255,255,255,.07);\
color: #8F908A\
}\
.ace-hokus .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-hokus {\
background-color: rgb(30, 23, 41);\
color: #F8F8F2\
}\
.ace-hokus .ace_cursor {\
color: #F8F8F0\
}\
.ace-hokus .ace_marker-layer .ace_selection {\
background: RGBA(50, 92, 212, 0.35)\
}\
.ace-hokus.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-hokus .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-hokus .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-hokus .ace_marker-layer .ace_active-line {\
background: RGBA(0,0,0,.3)\
}\
.ace-hokus .ace_gutter-active-line {\
background-color: RGBA(0,0,0,.3)\
}\
.ace-hokus .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-hokus .ace_invisible {\
color: #52524d\
}\
.ace-hokus .ace_entity.ace_name.ace_tag,\
.ace-hokus .ace_keyword,\
.ace-hokus .ace_meta.ace_tag,\
.ace-hokus .ace_storage {\
color: #F92672\
}\
.ace-hokus .ace_punctuation,\
.ace-hokus .ace_punctuation.ace_tag {\
color: #fff\
}\
.ace-hokus .ace_constant.ace_character,\
.ace-hokus .ace_constant.ace_language,\
.ace-hokus .ace_constant.ace_numeric,\
.ace-hokus .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-hokus .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-hokus .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-hokus .ace_support.ace_constant,\
.ace-hokus .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-hokus .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-hokus .ace_storage.ace_type,\
.ace-hokus .ace_support.ace_class,\
.ace-hokus .ace_support.ace_type {\
font-style: italic;\
color: #66D9EF\
}\
.ace-hokus .ace_entity.ace_name.ace_function,\
.ace-hokus .ace_entity.ace_other,\
.ace-hokus .ace_entity.ace_other.ace_attribute-name,\
.ace-hokus .ace_variable {\
color: #A6E22E\
}\
.ace-hokus .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-hokus .ace_string {\
color: #E6DB74\
}\
.ace-hokus .ace_comment {\
color: #75715E\
}\
.ace-hokus .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
