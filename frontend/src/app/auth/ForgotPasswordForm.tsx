"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="email" className="sr-only">Email</label>
      <Input id="email" type="email" placeholder="Email" required />
      <Button type="submit" className="w-full">Отправить</Button>
    </form>
  );
}
