"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

import { defaultRules, type RulesConfig } from "@/lib/analyse"
import { AlertCircle, Plus, Save, Trash2, TrendingUp, XCircle } from "lucide-react"
import { toast } from "sonner"

const categoryConfig = {
    potential: {
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Potential Lead",
        description: "Emails that show strong buying intent or interest in your products/services",
    },
    query: {
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        label: "General Query",
        description: "Emails with questions or requests for information without clear buying intent",
    },
    dead: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        label: "Dead Lead",
        description: "Emails that show no interest, rejection, or are clearly not potential customers",
    },
}

export function RulesConfiguration() {
    const [rules, setRules] = useState<RulesConfig>(defaultRules)
    const [newRule, setNewRule] = useState({ category: "potential", text: "" })


    const addRule = (category: keyof RulesConfig) => {
        if (!newRule.text.trim()) return

        setRules((prev) => ({
            ...prev,
            [category]: [...prev[category], newRule.text.trim()],
        }))
        setNewRule({ category: "potential", text: "" })
    }

    const removeRule = (category: keyof RulesConfig, index: number) => {
        setRules((prev) => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index),
        }))
    }

    const saveRules = () => {
        // In a real app, this would save to a database
        localStorage.setItem("aiEmailRules", JSON.stringify(rules))
        toast.success("Rules saved successfully!")
    }

    return (
        <div className="space-y-6">
            {Object.entries(categoryConfig).map(([category, config]) => {
                const IconComponent = config.icon
                const categoryRules = rules[category as keyof RulesConfig]

                return (
                    <Card key={category} className={`border-2 ${config.borderColor} ${config.bgColor}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <IconComponent className={`h-5 w-5 mr-3 ${config.color}`} />
                                {config.label}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-2">{config.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Current Rules</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {categoryRules.map((rule, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                            <span className="text-sm text-gray-700 flex-1">{rule}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeRule(category as keyof RulesConfig, index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {categoryRules.length === 0 && (
                                        <p className="text-sm text-gray-500 italic p-3 bg-white rounded-lg border">
                                            No rules defined yet. Add some rules to help AI categorize emails.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Add New Rule</Label>
                                <div className="flex space-x-2">
                                    <Textarea
                                        placeholder={`Enter a rule for ${config.label.toLowerCase()} identification...`}
                                        value={newRule.category === category ? newRule.text : ""}
                                        onChange={(e) => setNewRule({ category: category as keyof RulesConfig, text: e.target.value })}
                                        className="flex-1 min-h-[80px]"
                                    />
                                    <Button
                                        onClick={() => addRule(category as keyof RulesConfig)}
                                        disabled={!newRule.text.trim() || newRule.category !== category}
                                        className="self-end"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="outline" onClick={() => setRules(defaultRules)}>
                    Reset to Defaults
                </Button>
                <Button onClick={saveRules}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Rules
                </Button>
            </div>

            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">How AI Rules Work</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Rules help the AI understand your specific business context</li>
                                <li>• More specific rules lead to better categorization accuracy</li>
                                <li>• Include keywords, phrases, and patterns relevant to your industry</li>
                                <li>• The AI considers all rules together to make categorization decisions</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
