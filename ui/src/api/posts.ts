import { authAxios } from "@/lib/axios-instance";
import axios from "axios";

export const CHUNK_SIZE = 4 * 1024 * 1024;
const BUCKET_ID = import.meta.env.VITE_ZUSTACK_BUCKET_ID;

export const deletePost = async (id: string) => {
  const response = await authAxios.delete(`/posts/${id}`);
  return response.data;
};

export const uploadVideoZustack = async ({
  jwt,
  file,
  resolution,
  chunkNumber,
  totalChunks,
  uuid,
  thumbnail,
}: {
  jwt: string;
  file: File;
  resolution: string; 
  chunkNumber: number;
  totalChunks: number;
  uuid: string;
  thumbnail: File | undefined; 
}) => {
  const start = chunkNumber * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  const chunkBlob = file.slice(start, end);

  const chunkFile = new File([chunkBlob], file.name, { type: file.type });

  const formData = new FormData();
  formData.append("file", chunkFile);
  formData.append("chunk_number", chunkNumber.toString());
  formData.append("total_chunks", totalChunks.toString());
  formData.append("client_id", uuid);
  formData.append("access", "private");
  formData.append("resolution", resolution);
  formData.append("timeline_preview", "yes");
  if (thumbnail) {
    formData.append("thumbnail", thumbnail, thumbnail.name);
  }
  const response = await axios.post(
    `https://zustack.com/files/upload/video/${BUCKET_ID}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getResolution = async (file: File, jwt: string) => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await axios.post(
    `https://zustack.com/files/resolution/video/${BUCKET_ID}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getPostsByID = async (id: string) => {
  const response = await authAxios.get(`/posts/${id}`);
  return response.data;
};

export const getPosts = async () => {
  const response = await authAxios.get("/posts");
  return response.data;
};

export const getSignUrl = async (scope: string) => {
  const response = await authAxios.post(`/posts/signurl/${scope}`);
  return response.data;
};

export const createPost = async (
  file_id: string,
  body: string,
) => {
  const response = await authAxios.post("/posts", {
    file_id,
    body,
  });
  return response.data;
};
