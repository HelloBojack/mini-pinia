import type { App, Ref } from "vue";

export const piniaSymbol = Symbol();

export interface Pinia {
  install: (app: App) => void;
  state: Ref<Record<string, any>>;
  _s: Map<string, any>;
}
