//@flow

import type { BaseDynamic } from './dynamic-form/BaseDynamic'
import type { ComponentContext } from './DynamicForm'

export interface IField {
    key: string,
    type: string
}

export interface IFieldGroup extends IField {
    fields: Array<IField>;
}

export type DynamicFormNode<Field : IField> = {
    field: Field,
    state: any,
    parent : ?DynamicFormNode<IField>,
    uiState: ?any
}

// export type ComponentContext<Field : IField> = {
//     node: {
//         field: Field,
//         state: any,
//         parent : ?DynamicFormNode
//     },
//     currentPath: string,
//     parentPath: string,
//     nodePath: string,
//     setPath: (node : DynamicFormNode)=>void,
//     value: any,
//     setValue: (value:any)=>void,
//     renderField: (node : DynamicFormNode, fn: any)=> any,
//     form: any
// }

export type ComponentProps<Field : IField> = {
    context: ComponentContext<Field>
}