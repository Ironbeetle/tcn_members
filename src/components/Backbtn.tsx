"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export const Backbtn = () => {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.back()}
            variant="outline"
            className="bg-amber-700 hover:bg-amber-800 text-white border-amber-600"
            size="sm"
        >
            Back
        </Button>
    )
}