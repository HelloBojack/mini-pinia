import {
  computed,
  getCurrentInstance,
  inject,
  isReactive,
  isRef,
  reactive,
  type ComputedRef,
} from "vue";
import { piniaSymbol, type Pinia } from "./rootStore";

interface Options {
  id: string;
  state: any;
  getters: any;
  actions: any;
}

function isComputed(v: any): v is ComputedRef {
  // 计算属性 是 ref 且 是 effect
  return !!(isRef(v) && (v as any).effect);
}

function createSetupStore<Id extends string, SS>(
  id: Id,
  setup: () => SS,
  options: Omit<Options, "id">,
  pinia: Pinia,
  isOptionsStore: boolean
) {
  const store = reactive({});

  const initialState = pinia.state.value[id];
  if (!isOptionsStore && !initialState) {
    pinia.state.value[id] = {};
  }

  const setupStore = setup();
  pinia._s.set(id, store);

  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isReactive(prop) || (isRef(prop) && !isComputed(prop))) {
      if (!isOptionsStore) {
        pinia.state.value[id][key] = prop;
      }
    }
  }

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

  const store = createSetupStore(id, setup, options, pinia, true);
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
        createSetupStore(id, setup, options, pinia, false);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }

    const store = pinia._s.get(id);

    return store;
  }

  return useStore;
}
