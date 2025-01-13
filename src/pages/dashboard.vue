<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Search } from "lucide-vue-next";
import BookCard from "../pages/common/book-card.vue";
import Input from "../components/ui/input/Input.vue";
import Loader from "../components/Loader.vue";
import {
  Pagination,
  PaginationList,
  PaginationListItem,
} from "../components/ui/pagination";
import PaginationFirst from "../components/ui/pagination/PaginationFirst.vue";
import PaginationPrev from "../components/ui/pagination/PaginationPrev.vue";
import Button from "../components/ui/button/Button.vue";
import PaginationEllipsis from "../components/ui/pagination/PaginationEllipsis.vue";
import PaginationNext from "../components/ui/pagination/PaginationNext.vue";
import PaginationLast from "../components/ui/pagination/PaginationLast.vue";
import LoginModal from "./common/login-modal.vue";
import { useAuth } from "../composables/auth";
import { toast } from "vue-sonner";
import BooksModal from "./common/books-modal.vue";
import { get, getWithoutAuth } from "@/utils/api";
import { useFetchMyBooks } from "@/composables/books";
let debounceTimeout: ReturnType<typeof setTimeout>;
const searchQuery = ref("");
const currentPage = ref(1);
const totalCount = ref(0);
const totalPages = ref(0);
const books = ref<any[]>([]);
const loading = ref(false);
const { isAuthenticated } = useAuth();
const isModalOpen = ref(false);
const isMyBooksModalOpen = ref(false);
const myBooks = ref<any[]>([]);
const defaultBooks = ref<any>();
const limit = 12;

const fetchMyBooks = async (isReload: boolean = false) => {
  if (myBooks.value.length > 0 && !isReload) {
    fetchBooksFromAPI(myBooks.value);
    return;
  }

  loading.value = true;
  const { fetchMyBooks } = useFetchMyBooks();
  const { success, message, data } = await fetchMyBooks();

  if (!success) {
    toast.error(message || "Failed to fetch books. Please try again.");
    loading.value = false;
    return;
  }

  myBooks.value = data.data;
  await fetchBooksFromAPI(myBooks.value);
};

const fetchBooksFromAPI = async (
  userBooks: any[] = [],
  query: string = "",
  page: number = 1
) => {
  loading.value = true;
  books.value = [];
  const offset = (page - 1) * limit;
  const url =
    query.length > 0
      ? `http://localhost:3000/search-book?isbn=${query}`
      : `http://localhost:3000/get-all-books?page=${offset}&limit=${limit}`;

  try {
    const { success, message, data } = await getWithoutAuth(url);

    if (!success) {
      toast.error(message || "Failed to fetch books. Please try again.");
      return;
    }

    const fetchedData = data.data || null;

    if (!fetchedData.work_count) {
      // Single book fetch scenario
      const coverId =
        fetchedData.covers?.length > 0 ? fetchedData.covers[0] : "";
      const added = userBooks.filter(
        (userBook: any) => userBook.title === fetchedData.title
      );

      books.value.push({
        title: fetchedData.title || "Unknown Title",
        authors: fetchedData.authors || [],
        cover_edition_key: query || "N/A",
        cover_id: coverId,
        added: added.length > 0,
        addedBookId: added.length > 0 ? added[0]?.id : null,
      });

      totalCount.value = 1;
      totalPages.value = Math.ceil(totalCount.value / limit);
    } else {
      totalCount.value = fetchedData.work_count || 0;
      totalPages.value = Math.ceil(totalCount.value / limit);

      books.value = fetchedData.works.map((book: any) => {
        const added = userBooks.filter(
          (userBook: any) => userBook.title === book.title
        );

        return {
          ...book,
          added: added.length > 0,
          addedBookId: added.length > 0 ? added[0]?.id : null,
        };
      });

      defaultBooks.value = fetchedData;
    }

    loading.value = false;
  } catch (error) {
    console.error("Error fetching books:", error);
    loading.value = false;
    toast.error("Error fetching books. Please try again later.");
  }
};

const updateMyBooks = (newBooks: any[]) => {
  myBooks.value = newBooks;
  books.value = defaultBooks.value.works.map((book: any) => {
    const added = newBooks.filter(
      (userBook: any) => userBook.title === book.title
    );

    return {
      ...book,
      added: added.length > 0,
      addedBookId: added.length > 0 ? added[0]?.id : null,
    };
  });
};

onMounted(() => {
  fetchMyBooks();
});

watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchBooksFromAPI(myBooks.value, newQuery);
  }, 500);
});

watch(currentPage, (newPage) => {
  fetchBooksFromAPI(myBooks.value, searchQuery.value, newPage);
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <header class="flex justify-between items-center mb-8">
      <div class="relative flex-1 max-w-xl">
        <Search
          class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <Input
          type="search"
          placeholder="Search books using ISBN..."
          class="pl-10 pr-4 py-2 w-full"
          v-model="searchQuery"
        />
      </div>
      <div class="flex items-center gap-4">
        <BooksModal
          v-if="isAuthenticated"
          :my-books="myBooks"
          :update-my-books="updateMyBooks"
          :dialog="isMyBooksModalOpen"
          :close-dialog="(isMyBooksModalOpen = false)"
        />
        <LoginModal
          v-if="!isAuthenticated"
          :dialog="isModalOpen"
          :close-dialog="(isModalOpen = false)"
        />
      </div>
    </header>
    <main>
      <Loader v-if="loading" size="12" :color="'blue-500'" />
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <BookCard
          v-for="(book, index) in books"
          :key="index"
          :title="book.title"
          :is-edit="false"
          :authors="book.authors || []" 
          :cover="book.cover_id?.toString()"
          :data="book"
          :reload-book="fetchMyBooks"
        ></BookCard>
      </div>

      <div class="flex justify-center mb-12 mt-4">
        <Pagination
          v-slot="{ page }"
          :total="51586"
          :sibling-count="1"
          show-edges
          :default-page="currentPage"
        >
          <PaginationList v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrev />

            <template v-for="(item, index) in items" :key="index">
              <PaginationListItem
                v-if="item.type === 'page'"
                :value="item.value"
                as-child
              >
                <Button
                  class="w-10 h-10 p-0"
                  :variant="item.value === page ? 'default' : 'outline'"
                  @click="currentPage = item.value"
                >
                  {{ item.value }}
                </Button>
              </PaginationListItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext />
            <PaginationLast />
          </PaginationList>
        </Pagination>
      </div>
    </main>
  </div>
</template>
