'use client'
import { useRouter } from "next/navigation"

export const Backbtn = () => {
    const router = useRouter();
    return(
        <>
            <div 
                onClick={() => router.back()} 
                className='h-full cursor-pointer'
            >
                <div className='flex flex-col justify-center h-full navlink apptextmini'>
                    Back
                </div>
            </div>
        </>
    )
}