import BaseDynamic from "./BaseDynamic";
import { NormalizeStateContext } from "./types";

type HiddenDynamicField = {
  type: string;
  key: string;
  value?: string;
  default?: string;
};

type HiddenDynamicState = {};

export class HiddenDynamic extends BaseDynamic<HiddenDynamicField, HiddenDynamicState> {
  normalizeState({ state, field }: NormalizeStateContext<HiddenDynamicField>) {
    let key = field.key;
    if (state[key] == null) {
      state[key] = field.default || "";
    }
    if (field.value != undefined) {
      state[key] = field.value;
    }
  }

  getType() {
    return "hidden";
  }

  renderComponent() {
    return null;
  }
}
