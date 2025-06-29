import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function Materials() {
    const materials = [
        {
            name: "Premium Hardwood",
            category: "Flooring & Furniture",
            image: "/placeholder.svg?height=300&width=400",
            description: "High-quality oak, maple, and cherry hardwood for flooring and custom furniture.",
            features: ["Sustainably sourced", "Various finishes", "Long-lasting durability"],
        },
        {
            name: "Roofing Materials",
            category: "Rooftop Solutions",
            image: "/placeholder.svg?height=300&width=400",
            description: "Complete range of roofing materials including shingles, tiles, and metal roofing.",
            features: ["Weather resistant", "Energy efficient", "Multiple styles"],
        },
        {
            name: "Structural Lumber",
            category: "Construction",
            image: "/placeholder.svg?height=300&width=400",
            description: "Grade-A structural lumber for framing, beams, and construction projects.",
            features: ["Kiln-dried", "Precision cut", "Load-bearing certified"],
        },
        {
            name: "Composite Decking",
            category: "Outdoor Living",
            image: "/placeholder.svg?height=300&width=400",
            description: "Low-maintenance composite decking materials in various colors and textures.",
            features: ["Fade resistant", "Splinter-free", "Easy maintenance"],
        },
        {
            name: "Custom Millwork",
            category: "Interior Finishing",
            image: "/placeholder.svg?height=300&width=400",
            description: "Custom-made trim, molding, and architectural millwork for interior finishing.",
            features: ["Custom profiles", "Multiple wood species", "Precision crafted"],
        },
        {
            name: "Insulation Systems",
            category: "Energy Efficiency",
            image: "/placeholder.svg?height=300&width=400",
            description: "Advanced insulation materials for optimal energy efficiency and comfort.",
            features: ["High R-value", "Moisture resistant", "Fire retardant"],
        },
    ]

    return (
        <section id="materials" className="py-20 bg-white">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        Premium Materials
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        Quality Materials for <span className="text-amber-600">Lasting Results</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        We source and supply only the finest building materials from trusted manufacturers to ensure your project
                        stands the test of time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {materials.map((material, index) => (
                        <Card key={index} className="overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300">
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={material.image || "/placeholder.svg"}
                                    alt={material.name}
                                    fill
                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge variant="secondary" className="bg-white/90 text-slate-700">
                                        {material.category}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{material.name}</h3>
                                <p className="text-slate-600 mb-4">{material.description}</p>
                                <ul className="space-y-2">
                                    {material.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
