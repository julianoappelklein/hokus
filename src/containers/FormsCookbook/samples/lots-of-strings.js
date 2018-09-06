//@flow

import type {FormCookbookSample} from '../samples';

export const lotsOfString: FormCookbookSample = {
    key:'lots-of-string',
    title:'Lots of Strings',
    description: 'Lots of strings.',
    fields: [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0].map((v,i)=>{
        return { key:`title-${i}`, title:`Title-${i}`, type:'string' }
    }),
    values: {
        
    }
}