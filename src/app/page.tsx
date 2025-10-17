import { AuthGuard } from "@/app/components/auth-guard";

export default function Home() {
  return <AuthGuard />;
}
