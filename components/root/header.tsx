"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone, Mail, Hammer, LogIn, ChevronLast } from "lucide-react"
import { AuthModal } from "./auth-modal"
import { cn } from "@/lib/utils"


export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navItems = [
        // { href: "#home", label: "Home" },
        // { href: "#about", label: "About" },
        // { href: "#services", label: "Services" },
        // { href: "#materials", label: "Materials" },
        // { href: "#projects", label: "Projects" },
        // { href: "#contact", label: "Contact" },
    ]

    const handleNavClick = (href: string) => {
        setIsOpen(false)
        const element = document.querySelector(href)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <header
            className={` transition-all duration-300 fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50" : "bg-transparent"
                }`}
        >
            {/* Top bar */}
            <div
                className={`border-b bg-slate-900 text-white transition-all duration-300 ${isScrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100"
                    }`}
            >
                <div className="container flex h-10 items-center justify-between px-4 text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                            <Phone className="h-3 w-3 animate-pulse" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 hover:text-amber-400 transition-colors">
                            <Mail className="h-3 w-3" />
                            <span>info@GMLRoofing.com</span>
                        </div>
                    </div>
                    <div className="text-xs animate-pulse">Licensed & Insured • 25+ Years Experience</div>
                </div>
            </div>

            {/* Main header */}
            <div className="container flex h-16 items-center justify-between px-4 mx-auto">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <Hammer className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            GML Roofing
                        </span>
                        <span className="text-xs text-slate-600">Building Excellence</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6">
                    {navItems.map((item, index) => (
                        <button
                            key={item.href}
                            onClick={() => handleNavClick(item.href)}
                            className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-all duration-300 relative group py-2"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 group-hover:w-full transition-all duration-300" />
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {/* Auth Buttons - Hidden on mobile, shown on desktop */}
                    <div className="hidden md:flex">
                        <Link href="/sign-in" className={cn(buttonVariants(), "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105")}>
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                            <ChevronLast className="h-4 w-4 ml-2" />
                        </Link>
                    </div>

                    {/* Get Free Quote Button - Hidden on small screens */}
                    <Button className="hidden sm:inline-flex md:hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        Get Free Quote
                    </Button>

                    {/* Mobile Navigation */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="lg:hidden bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all duration-300"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-lg">
                            <div className="flex flex-col gap-4 mt-8">
                                {navItems.map((item, index) => (
                                    <button
                                        key={item.href}
                                        onClick={() => handleNavClick(item.href)}
                                        className="text-lg font-medium text-slate-700 hover:text-amber-600 transition-all duration-300 py-3 text-left hover:translate-x-2 hover:bg-amber-50 rounded-lg px-4"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {/* Mobile Auth Buttons */}
                                <div className="mt-6 space-y-3 px-4">
                                    <div className="text-sm font-medium text-slate-700 mb-2">Account Access</div>
                                    <Link href="/sign-in" className={cn(buttonVariants(), "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105")}>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Sign In
                                        <ChevronLast className="h-4 w-4 ml-2" />
                                    </Link>
                                </div>

                                <Button className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    Get Free Quote
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
