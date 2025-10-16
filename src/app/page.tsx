import { AuthGuard } from "@/components/auth-guard";

export default function Home() {
  return <AuthGuard />;
}
