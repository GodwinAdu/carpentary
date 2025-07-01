"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"


interface CameraCaptureProps {
    onCapture: (imageDataUrl: string) => void
    onError?: (error: string) => void
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const startCamera = async () => {
        setIsLoading(true)
        try {
            // Stop existing stream if any
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                },
            })

            setStream(mediaStream)
            setIsCameraActive(true)

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (error) {
            console.error("Error accessing camera:", error)
            const errorMessage = error instanceof Error ? error.message : "Unable to access camera"
            onError?.(errorMessage)
            toast.error("Camera Error", {
                description: "Unable to access camera. Please check permissions or try uploading a photo instead.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
            setStream(null)
            setIsCameraActive(false)
        }
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            const context = canvas.getContext("2d")

            if (!context) return

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            // Draw the video frame to canvas
            context.drawImage(video, 0, 0)

            // Convert to data URL with good quality
            const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)

            // Stop camera and return image
            stopCamera()
            onCapture(imageDataUrl)

            toast.success("Photo captured!", {
                description: "Building photo has been captured successfully",
            })
        }
    }

    const switchCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
        if (isCameraActive) {
            stopCamera()
            // Small delay to ensure camera is stopped before starting new one
            setTimeout(() => {
                startCamera()
            }, 100)
        }
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                onCapture(result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [stream])

    if (!isCameraActive) {
        return (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">Capture a photo of the building</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={startCamera} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Starting Camera...
                            </>
                        ) : (
                            <>
                                <Camera className="h-4 w-4 mr-2" />
                                Open Camera
                            </>
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                    </Button>
                </div>
                <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Controls Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Top Controls */}
                    <div className="absolute top-4 right-4 pointer-events-auto">
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={stopCamera}
                            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={switchCamera}
                            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        <Button
                            size="lg"
                            onClick={capturePhoto}
                            className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black border-4 border-white shadow-lg"
                        >
                            <Camera className="h-6 w-6" />
                        </Button>

                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Grid Lines for Better Composition */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border border-white/20"></div>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Position the building in the frame and tap the capture button
            </p>

            <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
        </div>
    )
}
