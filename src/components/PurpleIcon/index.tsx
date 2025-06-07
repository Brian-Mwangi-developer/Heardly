import { cn } from "@/lib/utils";

type Props = {
    className?: string;
    children: React.ReactNode;
}

const PurpleIcon = ({ className, children }: Props) => {
    return (
        <div className={cn('px-4 py-2 bg-purple-300 rounded-md', className)}>
            {children}
        </div>
    )
}

export default PurpleIcon;