"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"
import { LoadingSpinner } from "./loading-spinner"

export function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000)
    }

    return (
        <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-slate-200/30 to-gray-200/30 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="container px-4 relative z-10 mx-auto">
                <ScrollReveal direction="up">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            Get In Touch
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                            Ready to Start{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                                Your Project?
                            </span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Contact us today for a free consultation and quote. We're here to help bring your vision to life.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        {[
                            {
                                icon: Phone,
                                title: "Phone",
                                content: "+1 (555) 123-4567",
                                subtitle: "Mon-Fri 8AM-6PM",
                                color: "from-green-500 to-emerald-500",
                            },
                            {
                                icon: Mail,
                                title: "Email",
                                content: "info@craftcarpentry.com",
                                subtitle: "We'll respond within 24hrs",
                                color: "from-blue-500 to-cyan-500",
                            },
                            {
                                icon: MapPin,
                                title: "Location",
                                content: "Greater Toronto Area",
                                subtitle: "Serving GTA & surrounding areas",
                                color: "from-purple-500 to-violet-500",
                            },
                            {
                                icon: Clock,
                                title: "Business Hours",
                                content: "Mon-Fri: 8AM-6PM",
                                subtitle: "Sat: 9AM-4PM • Sun: Emergency only",
                                color: "from-amber-500 to-orange-500",
                            },
                        ].map((item, index) => (
                            <ScrollReveal key={index} direction="left" delay={index * 100}>
                                <Card className="border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                                            >
                                                <item.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors duration-300">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-600 font-medium">{item.content}</p>
                                                <p className="text-sm text-slate-500">{item.subtitle}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <ScrollReveal direction="right" delay={200}>
                            <Card className="border-slate-200 shadow-xl bg-white/90 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-slate-900">Get Your Free Quote</CardTitle>
                                    <p className="text-slate-600">Fill out the form below and we'll get back to you within 24 hours.</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">First Name</label>
                                                <Input
                                                    placeholder="John"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Last Name</label>
                                                <Input
                                                    placeholder="Doe"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Email</label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Phone</label>
                                                <Input
                                                    type="tel"
                                                    placeholder="+1 (555) 123-4567"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Service Type</label>
                                            <Select required>
                                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300">
                                                    <SelectValue placeholder="Select a service" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="custom-home">Custom Home Building</SelectItem>
                                                    <SelectItem value="rooftop">Rooftop Construction</SelectItem>
                                                    <SelectItem value="renovation">Renovation & Remodeling</SelectItem>
                                                    <SelectItem value="woodwork">Custom Woodwork</SelectItem>
                                                    <SelectItem value="structural">Structural Work</SelectItem>
                                                    <SelectItem value="doors-windows">Doors & Windows</SelectItem>
                                                    <SelectItem value="materials">Building Materials</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Project Details</label>
                                            <Textarea
                                                placeholder="Please describe your project, timeline, and any specific requirements..."
                                                className="min-h-[120px] transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={isSubmitting || isSubmitted}
                                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <LoadingSpinner />
                                            ) : isSubmitted ? (
                                                <>
                                                    <CheckCircle className="mr-2 h-5 w-5" />
                                                    Message Sent!
                                                </>
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send className="ml-2 h-5 w-5" />
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-sm text-slate-500 text-center">
                                            By submitting this form, you agree to our privacy policy and terms of service.
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    )
}
