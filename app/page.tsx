import { About } from "@/components/root/about";
import { Contact } from "@/components/root/contact";
import { FloatingElements } from "@/components/root/floating-element";
import { Footer } from "@/components/root/footer";
import { Header } from "@/components/root/header";
import { Hero } from "@/components/root/hero";
import { Materials } from "@/components/root/materials";
import { Projects } from "@/components/root/projects";
import { Testimonials } from "@/components/root/testimonial";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background mx-auto relative overflow-hidden">
      <FloatingElements />
      <Header />
      <main className="relative z-10">
        <Hero />
        <About />

        <Materials />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
