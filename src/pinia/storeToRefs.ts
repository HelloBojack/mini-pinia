import { isReactive, isRef, toRaw, toRef } from "vue";

export function storeToRefs(store: any) {
  store = toRaw(store);
  const refs = {};
  for (const key in store) {
    const value = store[key];
    if (isRef(value) || isReactive(value)) {
      // @ts-expect-error: the key is state or getter
      refs[key] = toRef(store, key);
    }
  }
  return refs;
}
