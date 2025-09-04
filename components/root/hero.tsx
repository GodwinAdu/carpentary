import { Button } from "@/components/ui/button"
import { ArrowRight, Award, Users, Clock, Sparkles } from "lucide-react"
import Image from "next/image"
import { ScrollReveal } from "./scroll-reveal"
import { AnimatedCounter } from "./animated-counter"


export function Hero() {
    return (
        <section
            id="home"
            className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 py-20 lg:py-32"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <div className="absolute top-40 right-20 w-1 h-1 bg-slate-400 rounded-full animate-ping" />
                <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-slate-500 rounded-full animate-pulse" />
            </div>

            <div className="container px-4 relative z-10 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <ScrollReveal direction="up" delay={100}>
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <Sparkles className="h-4 w-4 animate-pulse" />
                                    Premium Building Materials
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                                    Expert Carpentry &{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 animate-pulse">
                                        Rooftop Solutions
                                    </span>
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Professional carpentry services and premium building materials for residential and commercial
                                    projects. From custom woodwork to complete rooftop installations.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={200}>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                                >
                                    Start Your Project
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-slate-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    View Our Work
                                </Button>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={300}>
                            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                                <div className="text-center group">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Users className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        <AnimatedCounter end={500} suffix="+" />
                                    </div>
                                    <div className="text-sm text-slate-600">Projects Completed</div>
                                </div>
                                <div className="text-center group">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        <AnimatedCounter end={25} suffix="+" />
                                    </div>
                                    <div className="text-sm text-slate-600">Years Experience</div>
                                </div>
                                <div className="text-center group">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Award className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        <AnimatedCounter end={100} suffix="%" />
                                    </div>
                                    <div className="text-sm text-slate-600">Satisfaction Rate</div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    <ScrollReveal direction="right" delay={400}>
                        <div className="relative group">
                            <div className="relative z-10 overflow-hidden rounded-2xl">
                                <Image
                                    src="/hero3.jpg"
                                    alt="Professional carpentry work"
                                    width={500}
                                    height={500}
                                    className="rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-xl border animate-bounce">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Licensed</div>
                                        <div className="text-xs text-slate-600">& Insured</div>
                                    </div>
                                </div>
                            </div>

                            {/* Background decorative elements */}
                            <div className="absolute -top-8 -right-8 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-r from-slate-200/40 to-gray-200/40 rounded-full blur-3xl animate-pulse" />
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
