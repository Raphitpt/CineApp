export interface Review {
  id: string;
  movie_id: string;
  author: string;
  comment: string;
  rating: number;
  created_at: string;
}

export interface ReviewWithMovie extends Review {
  movie?: { title: string }
}
