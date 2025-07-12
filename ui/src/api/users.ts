import { authAxios, noAuthAxios } from "@/lib/axios-instance";

export const login = async (
  email: string,
  password: string,
) => {
  const response = await noAuthAxios.post("/users/login", {
    email,
    password,
  });
  return response.data;
};

export const signup = async (
  email: string,
  password: string,
) => {
  const response = await noAuthAxios.post("/users/signup", {
    email,
    password,
  });
  return response.data;
};
