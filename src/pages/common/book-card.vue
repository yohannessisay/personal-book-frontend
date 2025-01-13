<template>
  <Card
    :class="`${
      props.isEdit ? '' : 'hover:scale-110'
    } duration-300 ease-in-out my-4`"
  >
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
      <p class="text-sm text-muted-foreground">{{ props.cover }}</p>

      <TooltipProvider v-if="!props.data.added">
        <Tooltip>
          <TooltipTrigger as-child>
            <Plus
              @click="addBook()"
              class="hover:text-white border-black cursor-pointer hover:scale-110 hover:bg-black duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
              :size="32"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Add book to my collection</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider v-else>
        <Tooltip>
          <TooltipTrigger as-child>
            <Minus
              @click="removeBook()"
              class="hover:text-white border-red-500 cursor-pointer hover:scale-110 hover:bg-red-500 text-red-500 duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
              :size="32"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove book from my collection</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider
        v-if="updatedData.read_status !== 'unread' && props.isEdit"
      >
        <Tooltip>
          <TooltipTrigger as-child>
            <BookCheck
              @click="markAsRead()"
              class="hover:text-white border-green-500 cursor-pointer hover:scale-110 hover:bg-green-500 text-green-500 duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
              :size="32"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark As Read</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider v-else-if="props.isEdit">
        <Tooltip>
          <TooltipTrigger as-child>
            <BookX
              @click="markAsRead()"
              class="hover:text-white border-orange-500 cursor-pointer hover:scale-110 hover:bg-orange-500 text-orange-500 duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
              :size="32"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark As Unread</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <BookNoteModal
        v-if="props.isEdit"
        :book-data="props.data.data"
        :close-dialog="(isNoteModalOpen = false)"
      />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import Card from "@/components/ui/card/Card.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import Tooltip from "@/components/ui/tooltip/Tooltip.vue";
import TooltipContent from "@/components/ui/tooltip/TooltipContent.vue";
import TooltipProvider from "@/components/ui/tooltip/TooltipProvider.vue";
import TooltipTrigger from "@/components/ui/tooltip/TooltipTrigger.vue";
import { useFetchMyBooks } from "@/composables/books";
import { deleteRequest, post, put } from "@/utils/api";
import { BookCheck, BookX, Minus, Plus } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import BookNoteModal from "./book-note-modal.vue";

const props = defineProps<{
  title: string;
  authors: any[];
  cover: string;
  isEdit: boolean;
  data: Record<string, any>;
  reloadBook: Function;
}>();
const isLoading = ref(true);

const isNoteModalOpen = ref(false);
const updatedData = ref({ ...props.data });
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
    coverId: props.cover,
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
    `/books/${updatedData.value.id}`
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
const markAsRead = async () => {
  isLoading.value = true;

  updatedData.value.read_status =
    updatedData.value.read_status == "read" ? "unread" : "read";
  const { success, message } = await put(`/books/${updatedData.value.id}`, {
    ...updatedData.value,
  });

  if (!success) {
    toast.error(message || "Failed to update book. Please try again.");
    isLoading.value = false;
    return;
  }

  toast.success("Book updated successfully!");
  isLoading.value = false;
  const { fetchBookById } = useFetchMyBooks();
  const { success: myBooksFetchSuccess, data } = await fetchBookById(
    updatedData.value.id
  );

  if (!myBooksFetchSuccess) {
    toast.error(
      myBooksFetchSuccess || "Failed to fetch books. Please try again."
    );
    return;
  }
  updatedData.value = data;
};
watch(
  () => props.data,
  (newData) => {
    updatedData.value = { ...newData.data };
  },
  { immediate: true }
);
</script>
