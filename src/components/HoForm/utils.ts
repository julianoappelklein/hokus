import { DynamicFormNode } from "./types";

export function traverse(o: any, fn: (obj: any, prop: string, value: any) => boolean | void): boolean | void {
  for (const i in o) {
    if (fn.apply(null, [o, i, o[i]])) {
      return true;
    }
    if (o[i] !== null && typeof o[i] === "object") {
      if (traverse(o[i], fn)) {
        return true;
      }
    }
  }
  return false;
}

export function setValidationErrorIntoState(state: any, key: string, message: string) {
  if (message) {
    if (state.__validationErrors == null) {
      state.__validationErrors = {};
    }
    state.__validationErrors[key] = message;
  } else {
    if (state.__validationErrors) {
      delete state.__validationErrors[key];
      if (Object.keys(state.__validationErrors).length === 0) {
        delete state.__validationErrors;
      }
    }
  }
}

export function getValidationError(state: any, key: string): string | null {
  if (state.__validationErrors != null) {
    return state.__validationErrors[key];
  }
  return null;
}

export function hasValidationErrorInTree(state: any): boolean {
  return (
    traverse(state, (parent, prop, value) => {
      return parent.__validationErrors != null;
    }) || false
  );
}

export function hasValidationErrorInTree2(state: any, nodePath: string): boolean {
  return (
    traverse(state, (parent, prop, value) => {
      return (
        parent.__validationErrors != null && Object.keys(parent.__validationErrors).some(x => x.startsWith(nodePath))
      );
    }) || false
  );
}

export function buildNodePath(node: DynamicFormNode<any>) {
  let path = node.field.key;
  while (node.parent != null) {
    node = node.parent;
    path += `|${node.field.key}`;
  }
  return path;
}
