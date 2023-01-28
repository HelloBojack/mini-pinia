import { defineStore } from "@/pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount() {
      return this.count * 2;
    },
    trCount: (state) => state.count * 3,
  },
  actions: {
    increment() {
      console.log(this);

      this.count++;
    },
  },
});
