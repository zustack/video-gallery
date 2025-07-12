import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="mt-[100px]">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl">
            404
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold md:text-4xl">
            Something's missing.
          </p>
          <p className="mb-4 text-lg font-light">
            Sorry, we can't find that page. You'll find lots to explore on the
            home page.{" "}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/dashboard")}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
