import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { CircleUser, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

export default function Navbar() {
  const { isAuth, logout, email } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="container mx-auto px-[10px] mt-[10px] xl:px-[200px]">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={location.pathname === "/" ? "default" : "secondary"}
            onClick={() => navigate("/")}
          >
            About
          </Button>
          <Button
            variant={location.pathname === "/gallery" ? "default" : "secondary"}
            onClick={() => {
              if (!isAuth) {
                toast.error("You must be logged in to view the Gallery.");
                navigate("/login");
              } else {
                navigate("/gallery");
              }
            }}
          >
            Gallery
          </Button>
        </div>
        {isAuth ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex gap-2">
                  <User className="h-4 w-4 text-zinc-300" />
                  Hello {email}
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex gap-2"
              >
                <LogOut className="w-4 h-4 text-zinc-300" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button
              variant={
                location.pathname === "/signup" ? "default" : "secondary"
              }
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
            <Button
              variant={location.pathname === "/login" ? "default" : "secondary"}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
