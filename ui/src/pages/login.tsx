import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { login } from "@/api/users";
import type { ErrorResponse } from "@/lib/types";
import Spinner from "@/components/spinner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()
  const { setAuthState } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (response) => {
      setAuthState(
        response.token,
        response.userId,
        response.exp,
        response.email,
        true
      );
      navigate("/gallery")
      toast.success("Succesfull login!")
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response.data || "An unexpected error occurred.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="flex justify-center pt-[150px]">
      <form
        onSubmit={handleSubmit}
        className="grid gap-2 w-[400px] border p-[20px] rounded-md bg-secondary/80"
      >
        <h5 className="text-2xl text-center pb-[10px]">Login</h5>
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
          disabled={loginMutation.isPending}
        >
          <span>Login</span>
          {loginMutation.isPending && <Spinner />}
        </Button>
      </form>
    </div>
  );
}
