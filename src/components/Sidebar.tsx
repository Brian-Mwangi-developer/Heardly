"use client";

import { UserButton } from "@clerk/nextjs";
import { HomeIcon, InboxIcon, Music2Icon, PinIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./theme-toggle";

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const [isPinned, setIsPinned] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const accountMenuRef = useRef<HTMLDivElement>(null);

    const isExpanded = isMobile || isPinned || isHovered;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                accountMenuRef.current &&
                !accountMenuRef.current.contains(event.target as Node)
            ) {
                setShowAccountMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = () => {
        setShowAccountMenu(false);
    };

    return (
        <div className={`${isExpanded ? "w-64" : "w-18"} flex h-full flex-col border-r border-gray-200 py-3 px-4 transition-all duration-300`}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
        >
            <div className="flex items-center justify-between">
                <h1 className={`text-xl font-bold ${!isExpanded && "hidden"}`}>Heardly</h1>
                {!isMobile && (
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className="flex h-8 w-8 justify-center rounded-lg transition-all hover:bg-gray-100"
                        title={isPinned ? "Unpin sidebar" : "Pin sidebar"}>
                        <div className={`flex h-8 wp8 items-center justify-center transition-all ${isPinned ? "rounded-lg bg-gray-200" : "text-gray-500"}`}>
                            {isExpanded ? <PinIcon className="h-5 w-5 text-black" /> : <div className="flex h-fit w-fit items-center justify-center rounded-lg bg-white px-3 py-2 shadow">
                                <span className="text-md font-bold text-black">H</span>
                            </div>
                            }
                        </div>
                    </button>
                )}
            </div>
            {/* Navigation */}
            <nav className="mt-8 flex flex-1 flex-col">
                <SectionHeader isExpanded={isExpanded}>Playground</SectionHeader>
                <SidebarButton
                    icon={<HomeIcon />}
                    isExpanded={isExpanded}
                    isActive={pathname.includes("/home")}
                    href="/home"
                >
                    Home
                </SidebarButton>
                <SidebarButton
                    icon={<InboxIcon />}
                    isExpanded={isExpanded}
                    isActive={pathname.includes("/mail")}
                    href="/mail"
                >
                    Mail
                </SidebarButton>
                <SidebarButton
                    icon={<Music2Icon />}
                    isExpanded={isExpanded}
                    isActive={pathname.includes("/app/sound-effects")}
                    href="/mail"
                >
                    Resolve
                </SidebarButton>
            </nav>
            {/* Bottom Section */}
            <div className="relative mt-auto mb-20" ref={accountMenuRef}>
                <div className="flex flex-col h-5 w-5 flex-shrink-0 items-center justify-center gap-5">
                    <ThemeToggle />
                    <UserButton />
                </div>


            </div>
        </div>
    )
}



function SectionHeader({
    children,
    isExpanded,
}: {
    children: React.ReactNode;
    isExpanded: boolean;
}) {
    return (
        <div className="mb-2 mt-4 h-6 pl-4">
            <span
                className={`text-sm text-gray-500 transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0"}`}
            >
                {children}
            </span>
        </div>
    );
}




function SidebarButton({
    icon,
    children,
    isExpanded,
    isActive,
    href,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
    isExpanded: boolean;
    isActive: boolean;
    href: string;
}) {
    return (
        <Link
            href={href}
            className={`flex w-full items-center rounded-lg px-2.5 py-2 text-sm transition-colors ${isActive ? "bg-gray-300 font-medium text-gray-700" : "text-gray-600 hover:bg-gray-50"}`}
        >
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {icon}
            </div>
            <div
                className={`ml-3 overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}
                style={{ whiteSpace: "nowrap" }}
            >
                {children}
            </div>
        </Link>
    );
}