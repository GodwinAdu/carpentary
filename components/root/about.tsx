import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Hammer, Shield, Star } from "lucide-react"
import Image from "next/image"

export function About() {
    const features = [
        {
            icon: Hammer,
            title: "Expert Craftsmanship",
            description: "Over 25 years of experience in premium carpentry and construction",
        },
        {
            icon: Shield,
            title: "Licensed & Insured",
            description: "Fully licensed, bonded, and insured for your peace of mind",
        },
        {
            icon: Star,
            title: "Quality Materials",
            description: "We use only the finest materials from trusted suppliers",
        },
        {
            icon: CheckCircle,
            title: "Guaranteed Work",
            description: "All our work comes with comprehensive warranties",
        },
    ]

    return (
        <section id="about" className="py-20 bg-white">
            <div className="container px-4 mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                About CraftCarpentry
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                                Building Dreams with <span className="text-amber-600">Precision & Care</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                For over two decades, CraftCarpentry has been the trusted name in premium building materials and expert
                                carpentry services. We specialize in custom woodwork, rooftop installations, and comprehensive building
                                solutions.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg">
                                                <feature.icon className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                                                <p className="text-sm text-slate-600">{feature.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <Image
                            src="/placeholder.svg?height=500&width=600"
                            alt="Carpentry workshop"
                            width={600}
                            height={500}
                            className="rounded-2xl shadow-xl"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-amber-600">25+</div>
                                <div>
                                    <div className="font-semibold text-slate-900">Years of Excellence</div>
                                    <div className="text-sm text-slate-600">Serving the community</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
