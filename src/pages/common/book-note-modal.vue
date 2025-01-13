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
import {  NotebookPen } from "lucide-vue-next";
import {  put } from "@/utils/api";
import { ref, watch } from "vue";
import { toast } from "vue-sonner";
import Textarea from "@/components/ui/textarea/Textarea.vue";
const props = defineProps<{
  bookData: any;
}>();
const emit = defineEmits(["close-dialog"]);
const loading = ref(false);
const bookData = ref({ ...props.bookData });
const updateNoteData = async () => {
  try {
    const { success, message, data } = await put(
      `/books/${bookData.value.id}`,
      {
        ...bookData.value,
      }
    );

    if (!success) {
      toast.error(message || "Failed to fetch books. Please try again.");
      loading.value = false;
      return;
    }

    bookData.value = {...data};
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
    console.error(error);
  }
};

watch(
  () => props.bookData,
  () => {
    bookData.value = props.bookData;
  },
  { immediate: true }
);
</script>
<template>
  <Dialog>
    <DialogTrigger as-child>
        <NotebookPen 
        class="hover:text-white border-yellow-500 cursor-pointer hover:scale-110 hover:bg-yellow-500 text-yellow-500 duration-300 ease-in-out border-2 rounded-full p-1 shadow-md"
        :size="32"
      />
    </DialogTrigger>
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit your note</DialogTitle>
        <DialogDescription>
          Here is the note you have taken for this book
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-1"> 
          <Textarea v-model="bookData.notes" placeholder="Type your note here." />
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="secondary"> Close </Button>
        </DialogClose>
      </DialogFooter>
      <Button @click="updateNoteData()" type="button" variant="default"> Update </Button>
    </DialogContent>
  </Dialog>
</template>
