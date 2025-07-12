import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { signup } from "@/api/users";
import type { ErrorResponse } from "@/lib/types";
import Spinner from "@/components/spinner";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()

  const signupMutation = useMutation({
    mutationFn: () => signup(email, password),
    onSuccess: () => {
      navigate("/login")
      toast.success("Account created!")
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response.data || "An unexpected error occurred.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signupMutation.mutate();
  };

  return (
    <div className="flex justify-center pt-[150px]">
      <form
        onSubmit={handleSubmit}
        className="grid gap-2 w-[400px] border p-[20px] rounded-md bg-muted"
      >
        <h5 className="text-2xl text-center pb-[10px]">Sign up</h5>
        <div className="grid gap-2 mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            placeholder="Your email address"
            required
          />
        </div>

        <div className="grid gap-2 mb-4">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            id="password"
            placeholder="••••••••"
          />
        </div>

        <Button
          className="w-full"
          type="submit"
          disabled={signupMutation.isPending}
        >
          <span>Create Account</span>
          {signupMutation.isPending && <Spinner />}
        </Button>
      </form>
    </div>
  );
}
