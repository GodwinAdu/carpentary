"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Camera } from "react-camera-pro"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
    CameraIcon,
    X,
    RotateCcw,
    Upload,
    Loader2,
    Settings,
    Zap,
    ZapOff,
    Grid3X3,
    Maximize,
    Minimize,
    Timer,
    Focus,
    Cloud,
} from "lucide-react"
import { toast } from "sonner"
import { useUploadThing } from "@/lib/uploadthing"

interface AdvancedCameraCaptureProps {
    onCapture: (imageUrl: string) => void
    onError?: (error: string) => void
}

type CameraFacing = "user" | "environment"
type ImageQuality = "low" | "medium" | "high" | "ultra"
type CaptureMode = "photo" | "timer"

const IMAGE_QUALITY_SETTINGS = {
    low: { width: 640, height: 480, quality: 0.6 },
    medium: { width: 1280, height: 720, quality: 0.8 },
    high: { width: 1920, height: 1080, quality: 0.9 },
    ultra: { width: 2560, height: 1440, quality: 0.95 },
}

// Helper function to convert data URL to File
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}

export function AdvancedCameraCapture({ onCapture, onError }: AdvancedCameraCaptureProps) {
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [facingMode, setFacingMode] = useState<CameraFacing>("environment")
    const [showSettings, setShowSettings] = useState(false)
    const [imageQuality, setImageQuality] = useState<ImageQuality>("high")
    const [showGrid, setShowGrid] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [flashEnabled, setFlashEnabled] = useState(false)
    const [captureMode, setCaptureMode] = useState<CaptureMode>("photo")
    const [timerCount, setTimerCount] = useState(0)
    const [zoom, setZoom] = useState([1])
    const [isCapturing, setIsCapturing] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    const cameraRef = useRef<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const { startUpload } = useUploadThing("imageUploader", {
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress)
        },
        onClientUploadComplete: (res) => {
            if (res && res[0]) {
                const uploadedUrl = res[0].url
                onCapture(uploadedUrl)
                setIsUploading(false)
                setUploadProgress(0)
                stopCamera()
                toast.success("Photo uploaded successfully!", {
                    description: "Your photo has been saved to the cloud",
                })
            }
        },
        onUploadError: (error) => {
            console.error("Upload error:", error)
            setIsUploading(false)
            setUploadProgress(0)
            toast.error("Upload failed", {
                description: error.message || "Failed to upload photo. Please try again.",
            })
        },
    })

    const startCamera = useCallback(async () => {
        setIsLoading(true)
        try {
            setIsCameraActive(true)
            toast.success("Camera ready", {
                description: "Camera is now active and ready to capture",
            })
        } catch (error) {
            console.error("Error starting camera:", error)
            const errorMessage = error instanceof Error ? error.message : "Unable to access camera"
            onError?.(errorMessage)
            toast.error("Camera Error", {
                description: "Unable to access camera. Please check permissions.",
            })
        } finally {
            setIsLoading(false)
        }
    }, [onError])

    const stopCamera = useCallback(() => {
        setIsCameraActive(false)
        setIsFullscreen(false)
        toast.info("Camera stopped", {
            description: "Camera has been deactivated",
        })
    }, [])

    const uploadImageToCloud = useCallback(
        async (imageDataUrl: string) => {
            try {
                setIsUploading(true)
                setUploadProgress(0)

                // Convert data URL to File
                const file = dataURLtoFile(imageDataUrl, `photo-${Date.now()}.jpg`)

                // Start upload
                await startUpload([file])
            } catch (error) {
                console.error("Error uploading image:", error)
                setIsUploading(false)
                setUploadProgress(0)
                toast.error("Upload failed", {
                    description: "Failed to upload photo. Please try again.",
                })
            }
        },
        [startUpload],
    )

    const capturePhoto = useCallback(async () => {
        if (!cameraRef.current) return

        setIsCapturing(true)

        try {
            // Flash effect
            if (flashEnabled) {
                const flashOverlay = document.createElement("div")
                flashOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          z-index: 9999;
          pointer-events: none;
        `
                document.body.appendChild(flashOverlay)
                setTimeout(() => document.body.removeChild(flashOverlay), 100)
            }

            const imageSrc = cameraRef.current.takePhoto()

            // Apply quality settings
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const img = new Image()

            img.onload = async () => {
                const settings = IMAGE_QUALITY_SETTINGS[imageQuality]
                canvas.width = settings.width
                canvas.height = settings.height

                ctx?.drawImage(img, 0, 0, settings.width, settings.height)
                const processedImage = canvas.toDataURL("image/jpeg", settings.quality)

                toast.success("Photo captured!", {
                    description: `High-quality photo captured at ${settings.width}x${settings.height}`,
                })

                // Upload to UploadThing
                await uploadImageToCloud(processedImage)
            }

            img.src = imageSrc
        } catch (error) {
            console.error("Error capturing photo:", error)
            toast.error("Capture failed", {
                description: "Failed to capture photo. Please try again.",
            })
        } finally {
            setIsCapturing(false)
        }
    }, [flashEnabled, imageQuality, uploadImageToCloud])

    const startTimerCapture = useCallback(() => {
        let count = 3
        setTimerCount(count)

        const timer = setInterval(() => {
            count--
            setTimerCount(count)

            if (count === 0) {
                clearInterval(timer)
                setTimerCount(0)
                capturePhoto()
            }
        }, 1000)
    }, [capturePhoto])

    const handleCapture = useCallback(() => {
        if (captureMode === "timer") {
            startTimerCapture()
        } else {
            capturePhoto()
        }
    }, [captureMode, startTimerCapture, capturePhoto])

    const switchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
        toast.info("Camera switched", {
            description: `Switched to ${facingMode === "user" ? "back" : "front"} camera`,
        })
    }, [facingMode])

    const toggleFullscreen = useCallback(() => {
        if (!isFullscreen && containerRef.current) {
            containerRef.current.requestFullscreen?.()
        } else if (document.fullscreenElement) {
            document.exitFullscreen?.()
        }
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    const handleFileUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (file) {
                try {
                    setIsUploading(true)
                    setUploadProgress(0)

                    toast.info("Uploading photo...", {
                        description: "Please wait while we upload your photo",
                    })

                    await startUpload([file])
                } catch (error) {
                    console.error("Error uploading file:", error)
                    setIsUploading(false)
                    setUploadProgress(0)
                    toast.error("Upload failed", {
                        description: "Failed to upload photo. Please try again.",
                    })
                }
            }
        },
        [startUpload],
    )

    if (!isCameraActive) {
        return (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="relative">
                    <CameraIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Professional Camera System</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Capture high-quality photos with automatic cloud upload</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                    <Button
                        onClick={startCamera}
                        disabled={isLoading || isUploading}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Initializing Camera...
                            </>
                        ) : (
                            <>
                                <CameraIcon className="h-4 w-4 mr-2" />
                                Launch Camera
                            </>
                        )}
                    </Button>

                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} size="lg">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                            </>
                        )}
                    </Button>
                </div>

                {isUploading && (
                    <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                            <Cloud className="h-4 w-4" />
                            Uploading to cloud... {uploadProgress}%
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                    </div>
                )}

                <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                    <Badge variant="secondary">HD Quality</Badge>
                    <Badge variant="secondary">Cloud Upload</Badge>
                    <Badge variant="secondary">Grid Lines</Badge>
                    <Badge variant="secondary">Timer Mode</Badge>
                </div>

                <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-black" : "aspect-video rounded-lg overflow-hidden bg-black"}`}
        >
            <Camera
                ref={cameraRef}
                facingMode={facingMode}
                aspectRatio="cover"
                numberOfCamerasCallback={(numberOfCameras) => {
                    console.log(`Number of cameras: ${numberOfCameras}`)
                }}
                errorMessages={{
                    noCameraAccessible: "No camera device accessible. Please connect your camera or try a different browser.",
                    permissionDenied: "Permission denied. Please refresh and give camera permission.",
                    switchCamera:
                        "It is not possible to switch camera to different one because there is only one video device accessible.",
                    canvas: "Canvas is not supported.",
                }}
            />

            {/* Upload Progress Overlay */}
            {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center min-w-64">
                        <Cloud className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-pulse" />
                        <h3 className="font-semibold mb-2">Uploading to Cloud</h3>
                        <Progress value={uploadProgress} className="w-full mb-2" />
                        <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                    </div>
                </div>
            )}

            {/* Timer Countdown Overlay */}
            {timerCount > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
                    <div className="text-white text-8xl font-bold animate-pulse drop-shadow-lg">{timerCount}</div>
                </div>
            )}

            {/* Grid Overlay */}
            {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border border-white/20"></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30">
                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setShowSettings(!showSettings)}
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>

                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setFlashEnabled(!flashEnabled)}
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                        {flashEnabled ? <Zap className="h-4 w-4 text-yellow-400" /> : <ZapOff className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={toggleFullscreen}
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={stopCamera}
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="absolute top-16 left-4 bg-black/90 backdrop-blur-md rounded-lg p-4 text-white z-30 min-w-64 border border-white/10">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Camera Settings
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Image Quality</label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(IMAGE_QUALITY_SETTINGS).map(([quality, settings]) => (
                                    <Button
                                        key={quality}
                                        size="sm"
                                        variant={imageQuality === quality ? "default" : "outline"}
                                        onClick={() => setImageQuality(quality as ImageQuality)}
                                        className="text-xs"
                                    >
                                        {quality.toUpperCase()}
                                        <span className="block text-xs opacity-70">{settings.width}p</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Zoom: {zoom[0].toFixed(1)}x</label>
                            <Slider value={zoom} onValueChange={setZoom} max={3} min={1} step={0.1} className="w-full" />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Grid Lines</span>
                            <Button size="sm" variant={showGrid ? "default" : "outline"} onClick={() => setShowGrid(!showGrid)}>
                                <Grid3X3 className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Capture Mode</span>
                            <Button
                                size="sm"
                                variant={captureMode === "timer" ? "default" : "outline"}
                                onClick={() => setCaptureMode(captureMode === "photo" ? "timer" : "photo")}
                            >
                                {captureMode === "timer" ? <Timer className="h-3 w-3" /> : <Focus className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-30">
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={switchCamera}
                    className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setCaptureMode(captureMode === "photo" ? "timer" : "photo")}
                    className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                >
                    {captureMode === "timer" ? <Timer className="h-4 w-4 text-blue-400" /> : <Focus className="h-4 w-4" />}
                </Button>

                <Button
                    size="lg"
                    onClick={handleCapture}
                    disabled={isCapturing || isUploading}
                    className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black border-4 border-white shadow-lg relative overflow-hidden transition-all duration-200 hover:scale-105"
                >
                    {isCapturing || isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <CameraIcon className="h-6 w-6" />
                    )}
                    {captureMode === "timer" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <Timer className="h-2 w-2 text-white" />
                        </div>
                    )}
                </Button>

                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                >
                    <Upload className="h-4 w-4" />
                </Button>
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm">
                        {IMAGE_QUALITY_SETTINGS[imageQuality].width}x{IMAGE_QUALITY_SETTINGS[imageQuality].height}
                    </Badge>
                    {flashEnabled && (
                        <Badge variant="secondary" className="bg-yellow-500/80 text-black border-0 backdrop-blur-sm">
                            Flash On
                        </Badge>
                    )}
                    {captureMode === "timer" && (
                        <Badge variant="secondary" className="bg-blue-500/80 text-white border-0 backdrop-blur-sm">
                            Timer Mode
                        </Badge>
                    )}
                    {zoom[0] > 1 && (
                        <Badge variant="secondary" className="bg-green-500/80 text-white border-0 backdrop-blur-sm">
                            {zoom[0].toFixed(1)}x Zoom
                        </Badge>
                    )}
                    <Badge variant="secondary" className="bg-purple-500/80 text-white border-0 backdrop-blur-sm">
                        <Cloud className="h-3 w-3 mr-1" />
                        Cloud Upload
                    </Badge>
                </div>
            </div>

            <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
        </div>
    )
}
