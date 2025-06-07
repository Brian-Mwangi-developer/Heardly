import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PurpleIcon from "../PurpleIcon";


type Props = {
    heading?: string;
    mainIcon: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    placeholder?: string;
    children?: React.ReactNode;
}

export const PageHeader = ({ heading, mainIcon, leftIcon, rightIcon, placeholder, children }: Props) => {
    return (
        <div className="w-full flex flex-col gap-8 rounded-md">
            <div className="w-full flex justify-center sm:justify-between items-center gap-8 flex-wrap">
                <p className="text-primary text-4xl font-semibold">{heading}</p>
            </div>
            <div className="w-full flex flex-wrap gap-6 items-center justify-between">
                <div className="w-full md:max-w-3/4 relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        type="text"
                        placeholder={placeholder || "Search..."}
                        className="pl-10 rounded-md"
                    />
                </div>
                <div className="md:max-w-1/4 w-full overflow-x-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}