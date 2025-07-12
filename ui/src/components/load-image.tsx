import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadImage({ src, cn }: { src: string; cn: string }) {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Skeleton
        style={{ display: !loading ? "none" : "block" }}
        className={cn}
      />
      <img
        src={src}
        alt="Image"
        className="rounded-md"
        style={{ display: loading ? "none" : "block" }}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}
