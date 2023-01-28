import { ref, computed } from "vue";
import { defineStore } from "@/pinia";

export const useCounterStore = defineStore("counter", () => {
  // 2. composition api
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  const trCount = computed(() => count.value * 3);
  function increment() {
    console.log("increment");
    count.value++;
  }
  return { count, doubleCount, trCount, increment };
});
