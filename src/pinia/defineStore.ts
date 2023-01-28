import { computed, getCurrentInstance, inject, reactive } from "vue";
import { piniaSymbol, type Pinia } from "./rootStore";

interface Options {
  id: string;
  state: any;
  getters: any;
  actions: any;
}

function createSetupStore<Id extends string, SS>(
  id: Id,
  setup: () => SS,
  options: Omit<Options, "id">,
  pinia: Pinia
) {
  const store = reactive({});
  const setupStore = setup();
  pinia._s.set(id, store);
  Object.assign(store, setupStore);
  return store;
}

function createOptionsStore<Id extends string>(
  id: Id,
  options: Omit<Options, "id">,
  pinia: Pinia
) {
  const { state, actions, getters } = options;
  function setup(): any {
    const localState = (pinia.state.value[id] = state ? state() : {});
    const wrapGetters = Object.keys(getters || {}).reduce(
      (computedGetters: Record<string, any>, name) => {
        computedGetters[name] = computed(() => {
          const store = pinia._s.get(id);
          return getters[name].call(store, store);
        });
        return computedGetters;
      },
      {}
    );
    return Object.assign(localState, actions, wrapGetters);
  }

  const store = createSetupStore(id, setup, options, pinia);
  return store;
}

export function defineStore<Id extends string>(
  id: Id,
  options: Omit<Options, "id">
): any;
export function defineStore(options: Options): any;
export function defineStore<Id extends string, SS>(
  id: Id,
  storeSetup: () => SS
): any;
// 函数重载最后要写最终实现
export function defineStore<Id extends string>(
  idOrOptions: Id | Options,
  setup?: any,
  setupOptions?: any
) {
  const isSetupStore = typeof setup === "function";
  let id: string;
  let options: any;
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    id = idOrOptions.id;
    options = idOrOptions;
  }

  function useStore() {
    // 当前 vue 实例
    const currentInstance = getCurrentInstance();
    const pinia: any = currentInstance && inject(piniaSymbol, null);

    if (!pinia._s.has(id)) {
      // 没有则创建
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }

    const store = pinia._s.get(id);

    return store;
  }

  return useStore;
}
