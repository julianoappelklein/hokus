//@flow

import type {FormCookbookSample} from '../samples';

let fields: Array<any> = [
    { key: 'boolean-section', title:'Boolean', type:'section', fields:[
        { key:'boolean', title:'boolean', type:'boolean' }
    ]},
    { key:'code-editor-section', title:'Code Editor', type:'section', fields:[
        { key:'code-editor-html', title:'Code Editor HTML', type:'code-editor', lightTheme:true, language: 'html' },
        { key:'code-editor-markdown', title:'Code Editor Markdown', type:'code-editor', language: 'markdown' }
    ]},
    { key:'markdown-section', title:'Markdown', type:'section', fields:[
        { key:'markdown', title:'Markdown', type:'markdown', multiLine:false },
        { key:'markdown', title:'Markdown MultiLine', type:'markdown', multiLine:true }
    ]},
    { key:'number-section', title:'Number', type:'section', fields:[
        { key:'number', title:'Number', type:'number' }
    ]},
    { key: 'readonly-section', title:'Readonly', type:'section', fields:[
        { key:'readonly', title:'Readonly', type:'readonly' }
    ]},
    { key: 'string-section', title:'String', type:'section', fields:[
        { key:'string', title:'String', type:'string' },
        { key:'string-multiLine', title:'String MultiLine', type:'string', multiLine:true }
    ]},
    { key: 'select-section', title:'Select', type:'section', fields:[
        { key:'select', title:'Select', type:'select', options:[1,2,3,4,5].map((v)=>({value:v.toString(), text:v.toString()})) }
    ]},
];

let codeStartEnd = '```';


fields.forEach(field => {
    field.fields.push({
        key: field.key+'-info',
        type: 'info',
        theme: 'black-bare',
        content: `Sample code:

${codeStartEnd}
${JSON.stringify(field.fields, null, '  ')}
${codeStartEnd}
`
    });
})

export const allComponents: FormCookbookSample = {
    key:'all-components',
    title:'Some Components',
    description: 'Some componentes, ordered alphabetically.',
    fields,
    values: {
        readonly: 'You can\'t change this.'
    }
}
