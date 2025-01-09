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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/composables/auth";
import {  User } from "lucide-vue-next";
import { ref } from "vue";
import { toast } from "vue-sonner";

const emit = defineEmits(["close-dialog"]);
const email = ref("");
const password = ref("");
const { login } = useAuth();

const signIn = async () => {
  try {
    const res = login(email.value, password.value);

    if (!res) {
      toast.error("Login failed. Please check your credentials.");
    }

    toast.success("Login successful!");
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
    console.error(error);
  }
};

 
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <User
        class="cursor-pointer hover:scale-110 duration-300 ease-in-out border rounded-full p-1 shadow-md"
        :size="32"
      />
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Login with your credentials here</DialogTitle>
        <DialogDescription>
          Seems like you have not logged in yet. Please login to continue.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="flex flex-col items-start gap-4">
          <Label for="email" class="text-right"> Email </Label>
          <Input
            id="email"
            v-model="email"
            placeholder="Enter your email"
            class="col-span-3"
            type="email"
            required
          />
        </div>

        <div class="flex flex-col items-start gap-4">
          <Label for="password" class="text-right"> Password </Label>
          <Input
            id="password"
            v-model="password"
            placeholder="Enter your password"
            class="col-span-3"
            type="password"
            required
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" @click="signIn"> Login </Button>
          <Button type="button" variant="secondary"> Close </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
