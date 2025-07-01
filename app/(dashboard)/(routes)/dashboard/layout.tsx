

import Navbar from "@/components/Navbar";
import AppSidebarMain from "@/components/sidebar/app-sidebar-main";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { TourProvider } from "@/hooks/TourContext";
import { currentUser } from "@/lib/helpers/session";
import TourLayout from "@/providers/TourLayout";


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [user] = await Promise.all([
        currentUser() ?? null,
    ]);

    return (
        <TourProvider>
            <TourLayout>
                <SidebarProvider className="sidebar">
                    <AppSidebarMain />
                    <SidebarInset >
                        <Navbar user={user} />
                        <div className="relative scrollbar-hide">
                            <div id="main-content" className="py-4 px-4 overflow-hidden scrollbar-hide">
                                {children}
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </TourLayout>
        </TourProvider>
    );
}
