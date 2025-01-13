import { get } from "@/utils/api";
import { ref } from "vue";

export function useFetchMyBooks() {
  const loading = ref(false);

  const fetchMyBooks = async (): Promise<any | null> => {
    try {
      const response = await get("/my-books");
      return response;
    } catch (error) {
      return error;
    }
  };
  const fetchBookById= async (id:number): Promise<any | null> => {
    try {
      const response = await get(`/books/${id}`);
      return response;
    } catch (error) {
      return error;
    }
  };
  return {
    loading,
    fetchMyBooks,
    fetchBookById
  };
}
