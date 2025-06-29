import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, MapPin, Star } from "lucide-react"
import Image from "next/image"
import { ScrollReveal } from "./scroll-reveal"


export function Projects() {
    const projects = [
        {
            title: "Modern Family Home",
            category: "Residential Construction",
            location: "Oakville, ON",
            date: "2024",
            image: "/placeholder.svg?height=400&width=600",
            description: "Complete custom home construction featuring modern design elements and sustainable materials.",
            highlights: ["3,500 sq ft", "Custom millwork", "Energy efficient", "Smart home integration"],
            rating: 5,
            featured: true,
        },
        {
            title: "Commercial Rooftop Renovation",
            category: "Commercial Roofing",
            location: "Toronto, ON",
            date: "2024",
            image: "/placeholder.svg?height=400&width=600",
            description: "Large-scale commercial rooftop renovation with advanced waterproofing and insulation systems.",
            highlights: ["15,000 sq ft", "Waterproof membrane", "Insulation upgrade", "10-year warranty"],
            rating: 5,
            featured: true,
        },
        {
            title: "Luxury Kitchen Remodel",
            category: "Interior Renovation",
            location: "Mississauga, ON",
            date: "2023",
            image: "/placeholder.svg?height=400&width=600",
            description: "High-end kitchen renovation featuring custom cabinetry and premium hardwood finishes.",
            highlights: ["Custom cabinets", "Hardwood flooring", "Granite countertops", "LED lighting"],
            rating: 5,
            featured: false,
        },
        {
            title: "Outdoor Deck & Pergola",
            category: "Outdoor Living",
            location: "Burlington, ON",
            date: "2023",
            image: "/placeholder.svg?height=400&width=600",
            description: "Beautiful outdoor living space with composite decking and custom pergola structure.",
            highlights: ["Composite decking", "Custom pergola", "Built-in seating", "Lighting system"],
            rating: 5,
            featured: false,
        },
        {
            title: "Heritage Home Restoration",
            category: "Restoration",
            location: "Hamilton, ON",
            date: "2023",
            image: "/placeholder.svg?height=400&width=600",
            description:
                "Careful restoration of a 1920s heritage home preserving original character while adding modern amenities.",
            highlights: ["Heritage preservation", "Original millwork", "Modern systems", "Period accuracy"],
            rating: 5,
            featured: false,
        },
        {
            title: "Office Building Renovation",
            category: "Commercial Construction",
            location: "Markham, ON",
            date: "2022",
            image: "/placeholder.svg?height=400&width=600",
            description: "Complete office building renovation including structural modifications and modern finishes.",
            highlights: ["Structural work", "Open concept", "Modern finishes", "HVAC integration"],
            rating: 5,
            featured: false,
        },
    ]

    return (
        <section id="projects" className="py-20 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200/20 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="container px-4 relative z-10 mx-auto">
                <ScrollReveal direction="up">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            Our Portfolio
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                            Recent Projects &{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                                Success Stories
                            </span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Explore our portfolio of completed projects showcasing our expertise in carpentry, construction, and
                            building materials.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <ScrollReveal key={index} direction="up" delay={index * 100}>
                            <Card
                                className={`overflow-hidden bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group ${project.featured ? "ring-2 ring-amber-200 shadow-xl" : ""
                                    }`}
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={project.image || "/placeholder.svg"}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                                    />

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg">
                                            {project.category}
                                        </Badge>
                                        {project.featured && (
                                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg animate-pulse">
                                                Featured
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                                        {[...Array(project.rating)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    {/* Hover overlay content */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <Button
                                            size="sm"
                                            className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                        >
                                            View Details
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">
                                                {project.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                                                <MapPin className="h-4 w-4" />
                                                {project.location}
                                            </div>
                                            <div className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                                                <Calendar className="h-4 w-4" />
                                                {project.date}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-slate-900">Project Highlights:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {project.highlights.map((highlight, highlightIndex) => (
                                                    <Badge
                                                        key={highlightIndex}
                                                        variant="outline"
                                                        className="text-xs hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105"
                                                    >
                                                        {highlight}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal direction="up" delay={600}>
                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                        >
                            View All Projects
                            <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
