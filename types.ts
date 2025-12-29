export type Category = string;

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string for rich text simulation
  author: string;
  authorBio?: string;
  date: string;
  category: string;
  imageUrl?: string;
  imageCaption?: string;
  breaking?: boolean;
  status?: string;
  authorId?: string;
  views?: number;
}

export interface Ad {
  id: string;
  company: string;
  tagline: string;
  imageUrl: string;
  phone: string;
  buttonText?: string | null;
  buttonUrl?: string | null;
  districts?: string | null;
  bw?: boolean;
  status?: string;
  publishFrom?: Date | null;
  publishTo?: Date | null;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number; // Percentage
}

export interface FiveMServerData {
  clients: number;
  sv_maxclients: number;
  hostname: string;
  connectEndPoints: string[];
  vars: {
    banner_detail: string;
    sv_projectName: string;
    sv_projectDesc: string;
  };
}