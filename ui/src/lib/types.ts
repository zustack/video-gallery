export type ErrorResponse = {
  response: {
    data: string;
  };
};

export type Post = {
  id: string;
  user_id: string;
  media_url: string;
  thumbnail: string;
  body: string;
  created_at: string;
}
