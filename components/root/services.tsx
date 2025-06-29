import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// ✅  Use icons that actually exist in lucide-react
import { Home, CloudRain, Wrench, Hammer, StepBackIcon as Stairs, DoorOpen } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"


export function Services() {
    const services = [
        {
            icon: Home,
            title: "Custom Home Building",
            description: "Complete home construction services from foundation to finish, tailored to your vision.",
            features: ["Architectural planning", "Foundation work", "Framing & structure", "Interior finishing"],
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: CloudRain,
            title: "Rooftop Construction",
            description:
                "Specialized rooftop installations, repairs, and maintenance for residential and commercial properties.",
            features: ["Roof installation", "Repair services", "Waterproofing", "Insulation systems"],
            color: "from-amber-500 to-orange-500",
        },
        {
            icon: Wrench,
            title: "Renovation & Remodeling",
            description: "Transform your existing space with our comprehensive renovation and remodeling services.",
            features: ["Kitchen remodeling", "Bathroom renovation", "Room additions", "Structural modifications"],
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Hammer,
            title: "Custom Woodwork",
            description: "Hand-crafted furniture, cabinetry, and decorative elements made to perfection.",
            features: ["Custom furniture", "Built-in cabinets", "Decorative millwork", "Hardwood flooring"],
            color: "from-purple-500 to-violet-500",
        },
        {
            icon: Stairs,
            title: "Structural Work",
            description: "Professional structural carpentry including stairs, decks, and load-bearing modifications.",
            features: ["Staircase construction", "Deck building", "Structural repairs", "Beam installation"],
            color: "from-red-500 to-pink-500",
        },
        {
            icon: DoorOpen,
            title: "Doors & Windows",
            description: "Expert installation and replacement of doors, windows, and related hardware.",
            features: ["Door installation", "Window replacement", "Trim work", "Hardware fitting"],
            color: "from-indigo-500 to-blue-500",
        },
    ]

    return (
        <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23f1f5f9\" fillOpacity=\"0.4\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

            <div className="container px-4 relative z-10">
                <ScrollReveal direction="up">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            Our Services
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                            Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Carpentry Solutions</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            From custom woodwork to complete building construction, we offer a full range of professional carpentry services.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ScrollReveal key={index} direction="up" delay={index * 100}>
                            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative">
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <CardHeader className="pb-4 relative z-10">
                                    <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        <service.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <CardTitle className="text-xl text-slate-900 group-hover:text-amber-600 transition-colors duration-300">
                                        {service.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 relative z-10">
                                    <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                        {service.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, featureIndex) => (
                                            <li
                                                key={featureIndex}
                                                className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-slate-700 transition-all duration-300"
                                                style={{ transitionDelay: `${featureIndex * 50}ms` }}
                                            >
                                                <div className={`w-1.5 h-1.5 bg-gradient-to-r ${service.color} rounded-full group-hover:scale-125 transition-transform duration-300`} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant="outline"
                                        className="w-full mt-4 border-slate-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 bg-transparent transition-all duration-300 group-hover:scale-105"
                                    >
                                        Learn More
                                    </Button>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
