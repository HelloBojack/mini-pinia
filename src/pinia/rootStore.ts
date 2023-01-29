import type { App, Ref } from "vue";

export const piniaSymbol = Symbol();

export interface Pinia {
  install: (app: App) => void;
  use: (plugin: any) => Pinia;
  state: Ref<Record<string, any>>;
  _s: Map<string, any>;
  _p: any[];
}
