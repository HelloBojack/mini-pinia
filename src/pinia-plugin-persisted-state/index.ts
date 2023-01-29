export function piniaPluginPersistedState(context: any) {
  const {
    options: { persist },
    store,
  } = context;

  if (!persist) return;

  const fromStorage = localStorage.getItem(store.$id);
  if (fromStorage) store.$patch(JSON.parse(fromStorage));

  store.$subscribe((_: any, state: any) => {
    localStorage.setItem(store.$id, JSON.stringify(state));
  });
}
