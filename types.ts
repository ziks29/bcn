export enum Category {
  LOCAL = "Местные новости",
  CRIME = "Криминал",
  POLITICS = "Политика",
  OPINION = "Мнение",
  BUSINESS = "Бизнес и Мет",
  LIFESTYLE = "Стиль жизни"
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML string for rich text simulation
  author: string;
  date: string;
  category: Category;
  imageUrl?: string;
  imageCaption?: string;
  breaking?: boolean;
}

export interface Ad {
  id: string;
  company: string;
  tagline: string;
  imageUrl: string;
  phone: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number; // Percentage
}