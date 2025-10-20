//data types
export interface StudyData {
  title: string;
  description: string;
  category: string;
  userId: string;
  author: string;
  isPublic: boolean;
  moves: Array<{ moveNumber: number; san: string; note: string }>;
  image: {
    url: string;
    alt: string;
  };
  createdAt: string;
}
