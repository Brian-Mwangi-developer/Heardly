
import { PageHeader } from "@/components/WebinarComponents/page-header";
import { api } from "@/trpc/server";
import { AttendedTypeEnum } from "@prisma/client";
import { GitGraph, HomeIcon, Magnet } from "lucide-react";
import PipelineLayout from "./_components/PipelineLayout";
import { formatColumnTitle } from "./_components/utils";

type Props = {
    params: Promise<{
        webinarId: string
    }>
}

const page = async ({ params }: Props) => {
    const { webinarId } = await params;
    const pipelineData = await api.attendance.getWebinarAttendance({ webinarId });
    if (!pipelineData.data) {
        return (
            <div className="text-3xl h-[400px] flex justify-center items-center">
                No Pipeline Found
            </div>
        )
    }

    return (
        <div className='w-full flex flex-col gap-8'>
            <PageHeader
                leftIcon={<Magnet className="w-4 h-4" />}
                mainIcon={<GitGraph className="w-12 h-12" />}
                rightIcon={<HomeIcon className="w-3 h-3" />}
                heading="Keep track of all your leads"
                placeholder="Search Name, Tag or Email .."
            />
            <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
                {Object.entries(pipelineData.data).map(([columnType,
                    columnData]) => (
                    <PipelineLayout
                        key={columnType}
                        title={formatColumnTitle(columnType as AttendedTypeEnum)}
                        count={columnData.count}
                        users={columnData.users}
                        tags={pipelineData.webinarTags}
                    />
                ))}
            </div>
        </div>
    )
}

export default page