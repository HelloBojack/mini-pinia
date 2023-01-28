import type { _Method } from "./types";

export function addSubscription<T extends _Method>(
  subscriptions: T[],
  callback: T
) {
  subscriptions.push(callback);

  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
    }
  };

  return removeSubscription;
}

export function triggerSubscriptions<T extends _Method>(
  subscriptions: T[],
  ...args: Parameters<T>
) {
  subscriptions.slice().forEach((callback) => callback(...args));
}
