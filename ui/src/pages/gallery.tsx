import { deletePost, getPosts } from "@/api/posts";
import CreatePost from "@/components/create-post";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/lib/types";
import LoadImage from "@/components/load-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import type { ErrorResponse } from "@/lib/types";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "@/components/spinner";

export default function Gallery() {
  const { userId } = useAuthStore();
  const [currentID, setCurrentID] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: (postID: string) => deletePost(postID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setCurrentID("");
    },
    onError: (error: ErrorResponse) => {
      setCurrentID("");
      toast.error(error.response.data || "An unexpected error occurred.");
    },
  });

  return (
    <div className="container mx-auto px-[10px] xl:px-[200px] mt-[50px]">
      <div className="pb-[10px]">
        <CreatePost />
      </div>
      <ScrollArea className="h-[800px] p-4 border rounded-md">
        <div className="flex flex-col">
          {isError && (
            <div className="flex justify-center mt-[100px]">
              <p>An unexpected error occurred.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-[5px]">
              <Skeleton className="rounded-md w-full h-[370px]" />
              <Skeleton className="rounded-md w-full h-[370px]" />
            </div>
          )}

          {data?.data?.map((post: Post, index: number) => (
            <div key={post.id}>
              <div className="flex flex-col gap-[5px]">
                <Link
                  className="hover:bg-secondary/80 border border-secondary/80 p-4 rounded-md"
                  to={`/video/${post.id}`}
                >
                  <LoadImage
                    cn="rounded-md w-full h-[400px]"
                    src={`${post.thumbnail}?jwt=${data.jwt}`}
                  />
                  <div className="flex justify-between pt-2">
                  <div className="flex flex-col gap-2">
                  <h5 className="text-xl">{post.body}</h5>
                  <p className="text-muted-foreground text-sm">
                    {post.created_at}
                  </p>
                  </div>
                  {userId == post.user_id && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCurrentID(post.id);
                        deletePostMutation.mutate(post.id);
                      }}
                      variant="destructive"
                    >
                      {post.id == currentID && deletePostMutation.isPending && (
                        <Spinner />
                      )}
                      Delete post
                    </Button>
                  )}
                  </div>
                </Link>
              </div>
              {index !== data.data.length - 1 && (
                <Separator className="my-[25px]" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
