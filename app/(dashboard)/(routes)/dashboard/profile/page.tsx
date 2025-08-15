import { currentUser } from "@/lib/helpers/session"
import { AdvancedProfile } from "./_components/profile-detail"


export default async function ProfilePage() {
    const user = await currentUser();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <AdvancedProfile user={user} />
            </div>
        </div>
    )
}
