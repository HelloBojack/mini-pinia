import { computed, getCurrentInstance, inject, reactive } from "vue";
import { piniaSymbol } from "./rootStore";

interface Options {
  id: string;
  state: any;
  getters: any;
  actions: any;
}

function createOptionsStore<Id extends Pick<Options, "id">>(
  id: Id,
  options: Omit<Options, "id">,
  pinia: any
) {
  const { state, actions, getters } = options;
  const store = reactive({});

  const localState = (pinia.state.value[id] = state ? state() : {});

  const wrapGetters = Object.keys(getters || {}).reduce(
    (computedGetters, name) => {
      computedGetters[name] = computed(() => getters[name].call(store, store));
      return computedGetters;
    },
    {}
  );

  pinia._s.set(id, store);

  Object.assign(store, localState, actions, wrapGetters);

  return store;
}

export function defineStore<Id extends string>(
  id: Id,
  options: Omit<Options, "id">
): any;
export function defineStore(options: Options): any;
// 函数重载最后要写最终实现
export function defineStore<Id extends string>(
  idOrOptions: Id | Options,
  setup?: any
) {
  let id: string;
  let options: any;
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    id = idOrOptions.id;
    options = idOrOptions;
  }

  function useStore() {
    // 当前 vue 实例
    const currentInstance = getCurrentInstance();
    const pinia = currentInstance && inject(piniaSymbol);

    if (!pinia._s.has(id)) {
      // 没有则创建
      createOptionsStore(id, options, pinia);
    }

    const store = pinia._s.get(id);

    return store;
  }

  return useStore;
}
