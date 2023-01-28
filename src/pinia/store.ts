import type { _Method } from "./types";
import {
  watch,
  computed,
  getCurrentInstance,
  inject,
  isReactive,
  isRef,
  reactive,
  toRefs,
  type ComputedRef,
} from "vue";
import { piniaSymbol, type Pinia } from "./rootStore";
import { addSubscription, triggerSubscriptions } from "./subscriptions";

interface Options {
  id: string;
  state: any;
  getters: any;
  actions: any;
}

function isPlainObject(value: any) {
  return (
    value &&
    typeof value === "object" &&
    Object.prototype.toString.call(value) === "[object Object]" &&
    typeof value.toJSON !== "function"
  );
}
function isComputed(v: any): v is ComputedRef {
  // 计算属性 是 ref 且 是 effect
  return !!(isRef(v) && (v as any).effect);
}

function mergeReactiveObjects(target: any, patchToApply: any) {
  for (const key in patchToApply) {
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(subPatch) && isPlainObject(targetValue)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }

  return target;
}

function createSetupStore<Id extends string, SS, T extends _Method>(
  id: Id,
  setup: () => SS,
  options: Omit<Options, "id">,
  pinia: Pinia,
  isOptionsStore: boolean
) {
  const actionSubscriptions: T[] = [];
  function $patch(partialStateOrMutator: any) {
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia.state.value[id]);
    } else {
      mergeReactiveObjects(pinia.state.value[id], partialStateOrMutator);
    }
  }
  function $subscribe(callback: T, options = {}) {
    watch(pinia.state.value[id], callback);
  }
  const partialStore = {
    $patch,
    $subscribe,
    $onAction: addSubscription.bind(null, actionSubscriptions),
  };

  const store = reactive(partialStore);

  const initialState = pinia.state.value[id];
  if (!isOptionsStore && !initialState) {
    pinia.state.value[id] = {};
  }

  const setupStore = setup();
  pinia._s.set(id, store);

  function wrapAction(name: string, action: T) {
    return function () {
      const args = Array.from(arguments);

      const afterCallbackList: Array<(resolvedReturn: any) => any> = [];
      const onErrorCallbackList: Array<(error: unknown) => unknown> = [];
      function after(callback: T) {
        afterCallbackList.push(callback);
      }
      function onError(callback: T) {
        onErrorCallbackList.push(callback);
      }

      triggerSubscriptions(actionSubscriptions, { args, after, onError });

      let ret;
      try {
        ret = action.apply(store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }

      if (ret instanceof Promise) {
        return ret
          .then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          })
          .catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
      }

      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }

  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isReactive(prop) || (isRef(prop) && !isComputed(prop))) {
      if (!isOptionsStore) {
        pinia.state.value[id][key] = prop;
      }
    } else if (typeof prop === "function") {
      setupStore[key] = wrapAction(key, prop);
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
    pinia.state.value[id] = state ? state() : {};
    // 不使用 toRefs，$Patch 时 mergeReactiveObjects 丢失响应式
    const localState = toRefs(pinia.state.value[id]);
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

  store.$reset = function $reset() {
    const initialState = state ? state() : {};
    this.$patch((state) => {
      Object.assign(state, initialState);
    });
  };

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
