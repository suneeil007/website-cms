
import { Button } from "@/components/ui/button";

function App() {
    return (
        <div className="flex min-h-screen items-center justify-center gap-4">
            <Button>Default Button</Button>

            <Button variant="outline">
                Outline Button
            </Button>

            <Button variant="destructive">
                Delete
            </Button>
        </div>
    );
}

export default App;
