"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, HardHat, LogIn, UserPlus, ChevronDown } from "lucide-react"
import { AuthModal } from "./auth-modal"


export function AuthButtons() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"signin" | "signup">("signin")
    const [modalRole, setModalRole] = useState<"client" | "worker">("client")

    const openModal = (mode: "signin" | "signup", role: "client" | "worker") => {
        setModalMode(mode)
        setModalRole(role)
        setIsModalOpen(true)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Sign In Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl">
                        <DropdownMenuItem
                            onClick={() => openModal("signin", "client")}
                            className="cursor-pointer hover:bg-amber-50 transition-colors"
                        >
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            <div>
                                <div className="font-medium">Client Sign In</div>
                                <div className="text-xs text-slate-500">Need carpentry services</div>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => openModal("signin", "worker")}
                            className="cursor-pointer hover:bg-amber-50 transition-colors"
                        >
                            <HardHat className="h-4 w-4 mr-2 text-amber-600" />
                            <div>
                                <div className="font-medium">Worker Sign In</div>
                                <div className="text-xs text-slate-500">Provide carpentry services</div>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                
            </div>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialMode={modalMode}
                initialRole={modalRole}
            />
        </>
    )
}
