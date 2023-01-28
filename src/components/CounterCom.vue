<script setup lang="ts">
import { useCounterStore } from "@/stores/counter2";
const counterStore = useCounterStore();
</script>
<template>
  <div>
    <div>Counter</div>

    <div>count:{{ counterStore.count }}</div>
    <div>doubleCount:{{ counterStore.doubleCount }}</div>
    <div>trCount:{{ counterStore.trCount }}</div>
    <!-- <button @click="click">Add</button> -->
  </div>
</template>
