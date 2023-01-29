import { ref, type App } from "vue";
import { piniaSymbol, setActivePinia, type Pinia } from "./rootStore";

export function createPinia(): Pinia {
  const _p: any[] = [];

  const pinia: Pinia = {
    install(app: App) {
      setActivePinia(pinia);
      // 所有 store, 都能获取 pinia
      app.provide(piniaSymbol, pinia);
      // app.config.globalProperties.$pinia = pinia;
    },
    // 安装 plugin
    use(plugin) {
      _p.push(plugin);
      return this;
    },
    // 保存每个 store 的 state
    state: ref({}),
    // _s 存放所有 store, counter1 -> store, counter2 -> store
    _s: new Map(),
    _p,
  };

  return pinia;
}
