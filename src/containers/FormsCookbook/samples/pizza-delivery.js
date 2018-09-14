//@flow

import type {FormCookbookSample} from '../samples';

export const pizzaDeliveryMenu: FormCookbookSample = {
    key:'pizza-delivery-menu',
    title:'Pizza Delivery Menu',
    description: 'A complex menu for a pizza delivery business.',
    fields: [
        { key:'title', title:'Title', type:'string', default: 'Pizza Menu', tip:'Your menu title.\n\nWill be your page title also.' },
        { key:'sizes', title:'Sizes', type:'accordion', fields: [
            { key:'title', title:'Title', type:'string', arrayTitle:true },
            { key:'price', title:'price', type:'string' },
            { key:'line1', title:'Line 1', type:'string' },
            { key:'line2', title:'Line 2', type:'string' }
        ]},
        { key:'categories', title:'Pizza Categories', type:'accordion', fields: [
            { key:'key', title:'Key', type:'string' },
            { key:'title', title:'Title', type:'string', arrayTitle:true },
            { key:'pizzas', title:'Pizza Flavours', type:'accordion', fields: [
                { key:'name', title:'Name', type:'string', arrayTitle:true },
                { key:'description', title:'Description', type:'string' }
            ]}
        ]}
    ],
    values: {
        title: 'Pizza Menu',
        sizes: [
            { title: 'Small', price:'$10', line1:'For one person', line2:'One flavor' },
            { title: 'Medium', price:'$18', line1:'For two persons', line2:'Two flavors' },
            { title: 'Large', price:'$24', line1:'For three persons', line2:'Three flavors' }
        ],
        categories: [
            { key: 'traditional', title:'Traditional', pizzas:[
                { name: 'Cheese', description: 'Cheese description.' }
            ] },
            { key: 'premium', title:'Premium', pizzas:[
                { name: 'Double Cheese Pizza', description: 'Double Cheese description.' }
            ] }
        ]
    }
}