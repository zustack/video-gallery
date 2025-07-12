import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, Image } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ErrorResponse } from "@/lib/types";
import Spinner from "./spinner";
import {
  createPost,
  getResolution,
  getSignUrl,
  uploadVideoZustack,
} from "@/api/posts";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth";
import generateFixedResolutions from "@/lib/resolution";
import { CHUNK_SIZE } from "@/api/posts";

export default function CreatePost() {
  const jwt = useRef<string | null>(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [thumbnail, setThumbnail] = useState<File>();
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const { userId } = useAuthStore();

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(`ws://localhost:8081/ws?user_id=${userId}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("connected");
      };

      socket.onmessage = (event) => {
        if (event.data == "success") {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          setIsOpen(false);
          setIsPending(false);
          setFile(undefined);
          setBody("");
          setThumbnail(undefined);
        }
      };

      socket.onerror = (err) => {
        console.error("Error in websocket: ", err);
      };

      socket.onclose = () => {
        console.log("Reconecting in 3s");
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
    };
  }, [userId]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const queryClient = useQueryClient();

  // 1. get the jwt for the zustack request
  const getSignUrlMutation = useMutation({
    mutationFn: () => getSignUrl("write"),
    onSuccess: (response) => {
      jwt.current = response.jwt;
      getResolutionMutation.mutate(response.jwt);
      setIsPending(true);
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response.data || "An unexpected error occurred.");
      setIsPending(false);
    },
  });

  // 0. get the resolution of the video and add 2 based calidades
  const getResolutionMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("No file provided");
      if (!jwt.current) throw new Error("Missing JWT");
      const chunkBlob =
        file.size > CHUNK_SIZE ? file.slice(0, CHUNK_SIZE) : file;
      const chunkFile = new File([chunkBlob], file.name, { type: file.type });
      return getResolution(chunkFile, jwt.current);
    },
    onSuccess: (response) => {
      const resolutions = generateFixedResolutions(response.resolution);
      uploadVideoZustackMutation.mutate(resolutions);
    },
    onError: (error: ErrorResponse) => {
      setIsPending(false);
      toast.error(error.response.data || "An unexpected error occurred.");
    },
  });

  // 2. upload the video to zustack
  const uploadVideoZustackMutation = useMutation({
    mutationFn: async (resolution: string) => {
      if (!file) throw new Error("No file provided");
      if (!jwt.current) throw new Error("No token provided");

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uuid = crypto.randomUUID();

      let lastChunkResponse: any = null;

      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const res = await uploadVideoZustack({
          jwt: jwt.current,
          file,
          resolution,
          chunkNumber,
          totalChunks,
          uuid,
          thumbnail,
        });

        if (chunkNumber === totalChunks - 1) {
          lastChunkResponse = res;
        }
      }
      return lastChunkResponse;
    },
    onSuccess: async (response) => {
      if (response?.file_id) {
        createPostMutation.mutate(response.file_id);
      }
    },
    onError: (error: ErrorResponse) => {
      setIsPending(false);
      toast.error(error.response?.data || "An unexpected error occurred.");
    },
  });

  // 3. create the new image gallery post with the file id and body
  const createPostMutation = useMutation({
    mutationFn: (file_id: string) => createPost(file_id, body),
    onError: (error: ErrorResponse) => {
      setIsPending(false);
      toast.error(error.response.data || "An unexpected error occurred.");
    },
  });

  return (
    <AlertDialog
      onOpenChange={(open: boolean) => setIsOpen(open)}
      open={isOpen}
    >
      <AlertDialogTrigger>
        <Button variant="outline">
          <Image className="h-4 w-4" />
          <span>Create new Post</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Create Post
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div>
              <div className="flex items-center justify-center p-2">
                <div className="mx-auto grid w-full max-w-md gap-6">
                  <div className="mx-auto grid w-full max-w-2xl gap-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="file">Video to Upload</Label>
                        <Button
                          id="file"
                          onClick={() => fileRef.current?.click()}
                          variant="outline"
                          className="flex justify-start gap-4"
                        >
                          <FileImage className="size-4" />
                          <span>
                            {file?.name ? (
                              <>{file?.name.slice(0, 40)}</>
                            ) : (
                              <>MP4, WEBM, OGG, MATROSKA, QUICKTIME</>
                            )}
                          </span>
                        </Button>
                        <Input
                          ref={fileRef}
                          required
                          onChange={handleFile}
                          id="file"
                          type="file"
                          className="hidden"
                          accept=".mkv,video/mp4,video/webm,video/ogg,video/x-matroska,video/quicktime"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="thumbnail">Video Thumbnail</Label>
                        <Button
                          id="thumbnail"
                          onClick={() => thumbnailRef.current?.click()}
                          variant="outline"
                          className="flex justify-start gap-4"
                        >
                          <FileImage className="size-4" />
                          <span>
                            {thumbnail?.name ? (
                              <>{thumbnail?.name.slice(0, 40)}</>
                            ) : (
                              <>JPEG, PNG, WEBP, GIF, SVG+XML</>
                            )}
                          </span>
                        </Button>
                        <Input
                          ref={thumbnailRef}
                          onChange={handleThumbnail}
                          id="file"
                          type="file"
                          className="hidden"
                          accept="image/jpeg, image/png, image/webp, image/gif, image/svg+xml"
                        />
                      </div>

                      <div className="grid w-full gap-3">
                        <Label htmlFor="body">Body</Label>
                        <Textarea
                          required
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="Type your body here."
                          id="body"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end">
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              disabled={isPending}
              onClick={() => {
                setIsPending(true);
                getSignUrlMutation.mutate();
              }}
            >
              <span>Create</span>
              {isPending && <Spinner />}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
