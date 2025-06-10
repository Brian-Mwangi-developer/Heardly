import { RulesConfiguration } from "@/components/rules-configuration"

export default function RulesPage() {
    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">AI Analysis Rules</h1>
                <p className="text-gray-600 mt-2">
                    Configure rules to help AI categorize emails as Potential, Query, or Dead leads
                </p>
            </div>
            <RulesConfiguration />
        </div>
    )
}
