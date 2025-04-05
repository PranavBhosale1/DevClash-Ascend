import { NextAuthOptions } from "next-auth"
import { AuthProvider } from "@/contexts/auth-context"

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
} 