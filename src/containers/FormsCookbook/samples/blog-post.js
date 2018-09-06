//@flow

import type {FormCookbookSample} from '../samples';

export const blogPost: FormCookbookSample = {
    key:'blog-post',
    title:'Blog Post',
    description: 'A simple blog post.',
    fields: [
        { key:'title', title:'Title', type:'string', default: 'Pizza Menu', tip:'The post title.' },
        { key:'mainContent', title:'Content', type:'code-editor', language: 'markdown' },
        { key:'images', title:'Images', type:'bundle-manager', path: '', extensions: ['png', 'jpg', 'jpeg' ]},
        { key:'pubdate', title:'Pub Date', type:'date'},
        { key:'draft', title:'Draft', type:'boolean'}
    ],
    values: {
        
    }
}
