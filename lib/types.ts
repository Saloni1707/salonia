
export type Item = {
    id: string;
    type: "art" | "article";
    title: string;
    body?: string;
    imageUrl?: string
    x: number; y: number; w: number; h: number;
    color?: string;
};

export type Article = {
    id: string;
    slug: string;
    title: string;
    body: string;
    imageUrl?: string;
    createdAt: string;
};

