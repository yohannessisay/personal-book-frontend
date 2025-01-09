<template>
  <Card class="hover:scale-110 duration-300 ease-in-out my-4">
    <div class="h-64 relative">
      <div class="flex flex-col space-y-3 m-2" v-if="isLoading">
        <Skeleton class="h-[125px] w-48 rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-4 w-48" />
        </div>
      </div>
      <img
        :src="coverUrl"
        alt="Cover of {{ title }}"
        class="object-cover rounded-md w-full h-full"
        :class="{ 'opacity-0': isLoading }"
        @load="onImageLoad"
        loading="lazy"
      />
    </div>

    <div class="p-4">
      <h3 class="font-medium text-lg">{{ title }}</h3>
      <p v-if="authors.length == 1" class="text-sm text-gray-500">
        <span
          v-for="(author, index) in props.authors"
          :key="index"
          class="inline-block max-w-full truncate"
        >
          {{ author?.name }}
        </span>
      </p>
      <p v-else class="text-sm text-gray-500">
        <span
          v-for="(author, index) in props.authors.slice(0, 2)"
          :key="index"
          class="inline-block max-w-full truncate"
        >
          {{ author?.name }} </span
        >...
      </p>
    </div>
    <CardFooter class="p-4 flex justify-between items-center">
      <p class="text-sm text-muted-foreground">{{ props.coverId }}</p>
      <Plus
        v-if="!props.data.added"
        @click="addBook()"
        class="hover:text-white border-black cursor-pointer hover:scale-110 hover:bg-black duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
        :size="32"
      />
      <Minus
        v-else
        @click="removeBook()"
        class="hover:text-white border-red-500 cursor-pointer hover:scale-110 hover:bg-red-500 text-red-500 duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
        :size="32"
      />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import Card from "@/components/ui/card/Card.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import { deleteRequest, post } from "@/utils/api";
import { Minus, Plus } from "lucide-vue-next";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  title: string;
  authors: any[];
  cover: string;
  coverId: string | null;
  data: Record<string, any>;
  reloadBook: Function;
}>();
const isLoading = ref(true);

const coverUrl = computed(() => {
  return props.cover
    ? `https://covers.openlibrary.org/b/id/${props.cover}-L.jpg`
    : "";
});
const onImageLoad = () => {
  isLoading.value = false;
};

const addBook = async () => {
  isLoading.value = true;
  const authorNames = props.authors.map((author) => author.name).join(", ");
  const bookData = {
    title: props.title,
    author: authorNames,
    coverId: props.coverId,
    read_status: "unread",
    user_rating: 0,
    notes: "",
  };

  const { success, message } = await post("/books", bookData);

  if (!success) {
    toast.error(message || "Failed to add book. Please try again.");
    isLoading.value = false;
    return;
  }

  toast.success("Book added successfully!");
  isLoading.value = false;
  props.reloadBook(true);
};
const removeBook = async () => {
  isLoading.value = true;

  const { success, message } = await deleteRequest(
    `/books/${props.data.addedBookId}`
  );

  if (!success) {
    toast.error(message || "Failed to remove book. Please try again.");
    isLoading.value = false;
    return;
  }

  toast.success("Book removed successfully!");
  isLoading.value = false;
  props.reloadBook(true);
};
</script>
