<template>
  <div class="flex justify-center items-center !w-full h-full">
    <div
      class="w-12 h-12 rounded-full animate-spin border border-solid border-yellow-500 border-t-transparent"
      :style="customStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "12",
  },
  color: {
    type: String,
    default: "yellow-500",
  },
  borderWidth: {
    type: String,
    default: "border-4",
  },
});

const customStyle = computed(() => {
  return {
    width: `${props.size}rem`,
    height: `${props.size}rem`,
    borderColor: `border-${props.color}`,
  };
});
</script>
