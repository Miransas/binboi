import { handlers } from "@/auth"; // Bir üst adımda oluşturduğumuz auth.ts dosyası

// GET ve POST isteklerini NextAuth'a devrediyoruz
export const { GET, POST } = handlers;