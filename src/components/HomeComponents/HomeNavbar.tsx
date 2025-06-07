import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-3xl text-primary font-bold bg-gradient-to-r from-primary to-accent bg-clip-text"
                        >
                            Heardly
                            <Zap className="inline-block ml-2 h-6 w-6 text-primary" />
                        </Link>

                    </div>
                    <div className="hidden md:block ml-10">
                        <div className="flex items-center space-x-8">
                            <Link href="#" className="text-sm text-gray-300 hover:text-white">
                                Pricing
                            </Link>
                            <Link href="#" className="text-sm text-gray-300 hover:text-white">
                                Resources
                            </Link>
                            <Link href="#" className="text-sm text-gray-300 hover:text-white">
                                Community
                            </Link>
                            <Link href="#" className="text-sm text-gray-300 hover:text-white">
                                Download
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/sign-in">
                            <Button className="cursor-pointer" >
                                Sign In
                            </Button>
                        </Link>
                        <Link href='/sign-up'>
                            <Button className="cursor-pointer">Get Started</Button>
                        </Link>

                    </div>
                </div>
            </div>
        </nav>
    )
}
