import Link from "next/link"
import { Hammer, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-slate-900 text-white">
            <div className="container px-4 py-16 mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                                <Hammer className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold">CraftCarpentry</span>
                                <span className="text-xs text-slate-400">Building Excellence</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Professional carpentry services and premium building materials for over 25 years. Licensed, insured, and
                            committed to excellence.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Custom Home Building
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Rooftop Construction
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Renovation & Remodeling
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Custom Woodwork
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Structural Work
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Building Materials
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#about" className="text-slate-400 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#projects" className="text-slate-400 hover:text-white transition-colors">
                                    Our Projects
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Testimonials
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="#contact" className="text-slate-400 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-amber-400" />
                                <span className="text-slate-400">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-amber-400" />
                                <span className="text-slate-400">info@craftcarpentry.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-amber-400" />
                                <span className="text-slate-400">Greater Toronto Area, ON</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <div className="text-sm font-medium text-white mb-2">Business Hours</div>
                            <div className="text-sm text-slate-400 space-y-1">
                                <div>Mon-Fri: 8:00 AM - 6:00 PM</div>
                                <div>Saturday: 9:00 AM - 4:00 PM</div>
                                <div>Sunday: Emergency only</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-400">
                            © {new Date().getFullYear()} CraftCarpentry. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm">
                            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
