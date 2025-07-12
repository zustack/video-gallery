import { getPostsByID } from "@/api/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function Video() {
  const { postID } = useParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", postID],
    queryFn: () => {
      if (!postID) throw new Error("Missing video id");
      return getPostsByID(postID);
    },
  });

  return (
    <div className="container mx-auto px-[10px] xl:px-[200px] mt-[50px]">
      {isError && (
        <div className="flex justify-center mt-[100px]">
          <p>An unexpected error occurred.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-[5px]">
          <Skeleton className="rounded-md w-full h-[370px]" />
        </div>
      )}

      <div style={{ position: "relative", paddingTop: "56.25%" }}>
        <iframe
          ref={iframeRef}
          src={data?.media_url}
          style={{
            display: loading ? "none" : "block",
            border: "none",
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
          }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
