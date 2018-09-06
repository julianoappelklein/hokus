//@flow

import type {FormCookbookSample} from '../samples';

export const websiteConfiguration: FormCookbookSample = {
    key:'website-configuration',
    title:'Website Configuration',
    description: 'Exposing a small set of properties of a website config.',
    fields: [
        { key: 'baseURL', title: 'Base URL', type: 'readonly', tip:'Yeah, this is a readonly field. Just in case you don\'t want an editor messing up with your website.' },
        { key: 'title', title: 'Title', type: 'string' },
        { key: 'params1', type:'pull', group:'params', fields: [
            { key: 'author', title: 'Author', type: 'string', tip:'This property is inside "params", but we\'ll gone abstract this in the UI.' },
            { key: 'description', title: 'Description', type: 'string', multiLine:'true', tip:'This property is inside "params", but we\'ll gone abstract this in the UI.' }
        ]}
    ],
    values: {
        title: 'Hokus, a sleek CMS for Hugo',
        baseURL: 'https://www.hokus.io',
        params: {
            author: 'Juliano Appel Klein',
            description: 'Hokus, a open source CMS for Hugo. Try it now!'
        }
    }
}
