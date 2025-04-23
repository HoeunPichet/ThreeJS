import NotificationButton from "@/components/Notifications";
import Scene from "@/components/Scene";
import Viewer from "@/components/Viewer";

export default function Home() {
    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-4xl mb-8">OneSignal Notifications Demo</h1>
                <NotificationButton />
            </main>
            <div className="h-130 w-200 mx-auto border-2">
                {/* <Scene /> */}
                <Viewer />
            </div>
        </>
    );
}
