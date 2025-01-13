<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Book } from "lucide-vue-next";
import { get } from "@/utils/api";
import BookCard from "./book-card.vue";
import {  ref, watch } from "vue";
import { toast } from "vue-sonner";
const props = defineProps<{
  myBooks: any[];
  updateMyBooks: Function;
}>();
const emit = defineEmits(["close-dialog"]);
const myBooks =   ref<any[]>([]);
const loading = ref(false);
const fetchMyBooks = async () => {
  try {
    const { success, message, data } = await get("/my-books");
    myBooks.value = data.data;

    if (!success) {
      toast.error(message || "Failed to fetch books. Please try again.");
      loading.value = false;
      return;
    }

    myBooks.value = data.data;
    props.updateMyBooks(myBooks.value);
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
    console.error(error);
  }
};
const syncBooks = () => {
  
  myBooks.value = props.myBooks.map((book) => {
    return {
      title: book.title,
      authors: book.author ? book.author.split(",").map((author: string) => ({ name: author.trim() })) : [],  
      cover_id: book.coverId?.toString(),
      data:book,
      added: true,
      addedBookId: book.id
    };
  }); 
  
};
 
watch(
  () => props.myBooks,
  () => {
    syncBooks();
  },
  { immediate: true }  
);
 
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Book
        class="cursor-pointer hover:scale-110 duration-300 ease-in-out border rounded-full p-1 shadow-md"
        :size="32"
      />
    </DialogTrigger>
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Your Saved Books <span class="bg-blue-500 text-white rounded-md ml-2 border  px-2">{{ myBooks.length }}</span></DialogTitle>
        <DialogDescription>
          Here are the books you have saved. You can view or edit them anytime.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
        >
          <BookCard
            v-for="(book, index) in myBooks"
            :key="index"
            :title="book.title"
            :is-edit="true"
            :authors="book.authors || []" 
            :cover="book.cover_id?.toString()"
            :data="book"
            :reload-book="fetchMyBooks"
          ></BookCard>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="secondary"> Close </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
