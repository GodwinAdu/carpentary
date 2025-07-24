
import { FloatingElements } from "@/components/root/floating-element";
import { Header } from "@/components/root/header";
import { Hero } from "@/components/root/hero";



export default function HomePage() {
  return (
    <div className="min-h-screen bg-background mx-auto relative overflow-hidden">
      <FloatingElements />
      <Header />
      <main className="relative z-10">
        <Hero />
      </main>
    </div>
  )
}
