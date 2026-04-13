declare module "*.mdx" {
  import type { MDXComponents } from "mdx/types";
  import type React from "react";

  type TocItem = { id: string; title: string; level: number };

  type PostMeta = {
    title: string;
    date: string;
    category: string;
    readTime: string;
    excerpt: string;
  };

  export const metadata: PostMeta;
  export const toc: TocItem[];

  const MDXContent: React.ComponentType<{ components?: MDXComponents }>;
  export default MDXContent;
}
