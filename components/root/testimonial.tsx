import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

export function Testimonials() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Homeowner",
            location: "Oakville, ON",
            image: "/placeholder.svg?height=80&width=80",
            rating: 5,
            text: "GML Roofing System transformed our vision into reality. Their attention to detail and quality craftsmanship exceeded our expectations. The team was professional, punctual, and delivered exactly what they promised.",
        },
        {
            name: "Michael Chen",
            role: "Property Developer",
            location: "Toronto, ON",
            image: "/placeholder.svg?height=80&width=80",
            rating: 5,
            text: "We've worked with GML Roofing System on multiple commercial projects. Their expertise in rooftop construction and building materials is unmatched. They consistently deliver high-quality work on time and within budget.",
        },
        {
            name: "Emily Rodriguez",
            role: "Interior Designer",
            location: "Mississauga, ON",
            image: "/placeholder.svg?height=80&width=80",
            rating: 5,
            text: "The custom millwork and cabinetry from GML Roofing System is absolutely stunning. Their craftsmen are true artists who understand both form and function. I recommend them to all my clients.",
        },
        {
            name: "David Thompson",
            role: "Restaurant Owner",
            location: "Burlington, ON",
            image: "/placeholder.svg?height=80&width=80",
            rating: 5,
            text: "GML Roofing System handled our restaurant renovation with incredible skill. They worked around our schedule and delivered a beautiful space that our customers love. The quality of their work is exceptional.",
        },
        {
            name: "Lisa Park",
            role: "Homeowner",
            location: "Hamilton, ON",
            image: "/placeholder.svg?height=80&width=80",
            rating: 5,
            text: "Our heritage home restoration was a complex project, but GML Roofing System handled it with expertise and care. They preserved the original character while adding modern functionality. Truly impressive work.",
        },
        {
            name: "Robert Wilson",
            role: "Architect",
            location: "Markham, ON",
            image: "/placeholder.svg?height=80&width=80",
            rating: 5,
            text: "I've collaborated with GML Roofing System on several projects. Their technical knowledge and problem-solving abilities are outstanding. They bring architectural visions to life with precision and artistry.",
        },
    ]

    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        Client Testimonials
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        What Our Clients <span className="text-amber-600">Say About Us</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Don&apos;t just take our word for it. Here&apos;s what our satisfied clients have to say about our work and service.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <Quote className="h-8 w-8 text-amber-200 absolute -top-2 -left-2" />
                                        <p className="text-slate-600 italic pl-6">{testimonial.text}</p>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                        <Image
                                            src={testimonial.image || "/placeholder.svg"}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                            <div className="text-sm text-slate-600">{testimonial.role}</div>
                                            <div className="text-xs text-slate-500">{testimonial.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
