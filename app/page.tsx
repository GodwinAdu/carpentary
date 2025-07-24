
import { FloatingElements } from "@/components/root/floating-element";
import { Header } from "@/components/root/header";
import { Hero } from "@/components/root/hero";
import { getCurrentUser } from "@/lib/helpers/session";



export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-background mx-auto relative overflow-hidden">
      <FloatingElements />
      <Header user={user} />
      <main className="relative z-10">
        <Hero />
      </main>
    </div>
  )
}
