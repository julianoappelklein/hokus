//@flow
import { allComponents } from './samples/all-components';
import { lotsOfString } from './samples/lots-of-strings';
import { blogPost } from './samples/blog-post';
import { pizzaDeliveryMenu } from './samples/pizza-delivery';
import { websiteConfiguration } from './samples/website-configuration';


export type FormCookbookSample = {
    key: string,
    title: string,
    description: string,
    fields: any,
    values: {}
}

export const samples = [
    allComponents,
    blogPost,
    lotsOfString,
    pizzaDeliveryMenu,
    websiteConfiguration
];