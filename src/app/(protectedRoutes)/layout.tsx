import Sidebar from "@/components/Sidebar";

type Props = {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-200/10">
            <Sidebar />
            <div className="flex-1 overflow-y-auto bg-background p-4">
                {children}
            </div>

        </div>
    )
}

export default Layout