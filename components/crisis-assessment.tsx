import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CrisisAssessmentProps {
  assessment: {
    id: string
    eventName: string
    riskLevel: string
    timestamp: string
    recommendedActions: string[]
    emergencyInstructions: string
    estimatedImpact: string
  }
}

export default function CrisisAssessment({ assessment }: CrisisAssessmentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "severe":
        return (
          <Badge variant="destructive" className="text-sm py-1 px-3">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Severe Risk
          </Badge>
        )
      case "high":
        return (
          <Badge variant="destructive" className="text-sm py-1 px-3 bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            High Risk
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="outline" className="text-sm py-1 px-3 bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="mr-1 h-3 w-3" />
            Moderate Risk
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-sm py-1 px-3 bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Low Risk
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-sm py-1 px-3">
            Unknown Risk
          </Badge>
        )
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Crisis Assessment</CardTitle>
            <CardDescription>AI-generated assessment for {assessment.eventName}</CardDescription>
          </div>
          <div className="mt-2 sm:mt-0">{getRiskBadge(assessment.riskLevel)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Assessment ID</h3>
          <p className="text-sm text-muted-foreground">{assessment.id}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Generated on</h3>
          <p className="text-sm text-muted-foreground">{formatDate(assessment.timestamp)}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Estimated Impact</h3>
          <p className="text-sm">{assessment.estimatedImpact}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Recommended Actions</h3>
          <ul className="list-disc pl-5 space-y-1">
            {assessment.recommendedActions.map((action, index) => (
              <li key={index} className="text-sm">
                {action}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-primary/10 p-4">
          <h3 className="font-medium mb-2 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-primary" />
            Emergency Instructions
          </h3>
          <p className="text-sm">{assessment.emergencyInstructions}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/submit-event">Submit Another Event</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

