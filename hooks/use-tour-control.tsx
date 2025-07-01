'use client'



import { useEffect, useRef } from 'react'
import { Step } from 'react-joyride'
import { useTour } from './TourContext'


export const useTourControl = (componentSteps: Step[]) => {
    const { addSteps, removeSteps } = useTour()
    const stepsRef = useRef(componentSteps)

    useEffect(() => {
        addSteps(stepsRef.current)
        return () => {
            removeSteps(stepsRef.current)
        }
    }, [addSteps, removeSteps])
}
