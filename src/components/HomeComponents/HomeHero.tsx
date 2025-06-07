import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
    return (
        <section className="flex min-h-[calc(100vh-3.5rem)] max-w-screen-3xl flex-col items-center justify-center space-y-8 py-16 text-center md:py-16">
            <div className="space-y-4">
                <h1 className=" flex flex-col shadow-gray-200  bg-clip-text text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
                    Get Deals Closed Faster
                    <br />
                    <br />
                    <p>With
                        <span className="bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent font-extrabold">
                            {" "}Heardly
                        </span>
                    </p>
                </h1>
                <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Empowering businesses with cutting-edge software solutions. From AI-driven analytics to seamless cloud
                    integrations, we're shaping the future of technology.
                </p>
            </div>
            <div className="flex gap-4">
                <Button size="lg" className="bg-white text-gray-700">
                    Explore Solutions
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant='default' size="lg" className="bg-gray-500 text-white">
                    Schedule a Demo
                </Button>
            </div>
        </section>
    )
}





