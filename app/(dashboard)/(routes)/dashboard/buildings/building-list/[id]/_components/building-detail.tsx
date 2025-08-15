"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Camera,
    Navigation,
    Edit,
    Trash2,
    Share,
    DollarSign,
    Star,
    User,
    Receipt,
    Plus,
    TrendingUp,
    Users,
    CheckCircle,
    AlertCircle,
    Upload,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { addComment, addPayment } from "@/lib/actions/building.actions"
import { fetchAllUsers } from "@/lib/actions/user.actions"
import { toast } from "sonner"

interface BuildingDetailPageProps {
    building: any
}

export default function BuildingDetailPage({ building }: BuildingDetailPageProps) {
    const [users, setUsers] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()
    // Comment form state
    const [commentForm, setCommentForm] = useState({
        userName: "",
        userEmail: "",
        comment: "",
        rating: 5,
        visitDate: new Date().toISOString().split("T")[0],
        images: [] as string[],
    })

    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        currency: "USD",
        paymentMethod: "bank_transfer",
        transactionId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        description: "",
        receivedBy: "",
        receivedByName: "",
        receiptUrl: "",
    })

    // UI state
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [submitMessage, setSubmitMessage] = useState("")

    // Load users when payment dialog opens
    const handlePaymentDialogOpen = async (open: boolean) => {
        setIsPaymentDialogOpen(open)
        if (open && users.length === 0) {
            try {
                const allUsers = await fetchAllUsers()
                setUsers(allUsers)
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }
    }

    const paymentProgress = building.totalPaidAmount && building.totalProjectCost 
        ? (building.totalPaidAmount / building.totalProjectCost) * 100 
        : 0

    const handleNavigate = () => {
        if (building.coordinates) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${building.coordinates.lat},${building.coordinates.lng}`
            window.open(url, "_blank")
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: building.name,
                text: `Check out this building: ${building.name}`,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    const handleSubmitComment = async () => {
        if (!commentForm.userName || !commentForm.userEmail || !commentForm.comment) {
            setSubmitMessage("Please fill in all required fields")
            return
        }

        startTransition(async () => {
            try {
                await addComment({
                    buildingId: building._id,
                    userName: commentForm.userName,
                    userEmail: commentForm.userEmail,
                    comment: commentForm.comment,
                    rating: commentForm.rating,
                    visitDate: commentForm.visitDate,
                    images: commentForm.images,
                })

                toast.success("Comment submitted successfully!")
                setCommentForm({
                    userName: "",
                    userEmail: "",
                    comment: "",
                    rating: 5,
                    visitDate: new Date().toISOString().split("T")[0],
                    images: [],
                })
                setIsCommentDialogOpen(false)
                setSubmitMessage("")
            } catch (error) {
                toast.error("Error submitting comment. Please try again.")
                setSubmitMessage("Error submitting comment. Please try again.")
            }
        })
    }

    const handleSubmitPayment = async () => {
        if (!paymentForm.amount || !paymentForm.receivedBy || !paymentForm.description) {
            setSubmitMessage("Please fill in all required fields")
            return
        }

        const receiver = users.find((user) => user._id === paymentForm.receivedBy)
        if (!receiver) {
            setSubmitMessage("Please select a valid receiver")
            return
        }

        startTransition(async () => {
            try {
                await addPayment({
                    buildingId: building._id,
                    amount: Number.parseFloat(paymentForm.amount),
                    currency: paymentForm.currency,
                    paymentMethod: paymentForm.paymentMethod,
                    transactionId: paymentForm.transactionId,
                    paymentDate: paymentForm.paymentDate,
                    description: paymentForm.description,
                    receivedBy: paymentForm.receivedBy,
                    receivedByName: receiver.fullName,
                    receiptUrl: paymentForm.receiptUrl,
                })

                toast.success("Payment recorded successfully!")
                setPaymentForm({
                    amount: "",
                    currency: "USD",
                    paymentMethod: "bank_transfer",
                    transactionId: "",
                    paymentDate: new Date().toISOString().split("T")[0],
                    description: "",
                    receivedBy: "",
                    receivedByName: "",
                    receiptUrl: "",
                })
                setIsPaymentDialogOpen(false)
                setSubmitMessage("")
            } catch (error) {
                toast.error("Error recording payment. Please try again.")
                setSubmitMessage("Error recording payment. Please try again.")
            }
        })
    }

    const getStatusColor = (status: string) => {
        const colors = {
            completed: "bg-green-500",
            in_progress: "bg-blue-500",
            pending: "bg-yellow-500",
            failed: "bg-red-500",
        }
        return colors[status as keyof typeof colors] || "bg-gray-500"
    }

    const getPaymentMethodIcon = (method: string) => {
        const icons = {
            bank_transfer: "🏦",
            credit_card: "💳",
            cash: "💵",
            check: "📝",
            digital_wallet: "📱",
        }
        return icons[method as keyof typeof icons] || "💰"
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" asChild className="mr-4">
                            <Link href="/dashboard/buildings">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{building.buildingType}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{building.address}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-green-600 mr-4" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${(building.totalPaidAmount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-orange-600 mr-4" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${(building.remainingBalance || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Star className="h-8 w-8 text-yellow-600 mr-4" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{building.averageRating || 0}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-purple-600 mr-4" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{building.totalVisits || 0}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Visits</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="payments">Payments</TabsTrigger>
                                <TabsTrigger value="comments">Reviews</TabsTrigger>
                                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Main Image */}
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="aspect-video relative rounded-lg overflow-hidden">
                                            <Image
                                                src={building.imageUrl || "/placeholder.svg"}
                                                alt={building.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <Badge className="absolute top-4 left-4">{building.category}</Badge>
                                            <Badge className="absolute top-4 right-4" variant="outline">
                                                {building.priority} priority
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Progress */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Progress</CardTitle>
                                        <CardDescription>
                                            ${building.totalPaidAmount.toLocaleString()} of $
                                            {(building.totalProjectCost || 0).toLocaleString()} paid
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress value={paymentProgress} className="h-3 mb-2" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {paymentProgress.toFixed(1)}% completed • ${(building.remainingBalance || 0).toLocaleString()}{" "}
                                            remaining
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Description */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{building.description}</p>
                                    </CardContent>
                                </Card>

                                {/* Enhanced Building Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Building Specifications</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-semibold mb-3">Physical Details</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Floors:</span>
                                                        <span>{building.buildingDetails?.floors || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
                                                        <span>{building.buildingDetails?.totalArea ? `${building.buildingDetails.totalArea.toLocaleString()} sq ft` : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Year Built:</span>
                                                        <span>{building.buildingDetails?.yearBuilt || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Parking Spaces:</span>
                                                        <span>{building.buildingDetails?.parkingSpaces || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-3">Project Team</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Architect:</span>
                                                        <span>{building.buildingDetails?.architect || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Contractor:</span>
                                                        <span>{building.buildingDetails?.contractor || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                            {building.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <h4 className="font-semibold mb-2 mt-4">Amenities</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {building.buildingDetails?.amenities?.map((amenity: string, index: number) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {amenity}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="payments" className="space-y-6">
                                {/* Add Payment Button */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">Payment History</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Track all payments received for this project
                                        </p>
                                    </div>
                                    <Dialog open={isPaymentDialogOpen} onOpenChange={handlePaymentDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Payment
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Record New Payment</DialogTitle>
                                                <DialogDescription>Add a new payment record for this building project</DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                {submitMessage && (
                                                    <Alert>
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>{submitMessage}</AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Amount *</label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Enter amount"
                                                            value={paymentForm.amount}
                                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Currency</label>
                                                        <Select
                                                            value={paymentForm.currency}
                                                            onValueChange={(value) => setPaymentForm({ ...paymentForm, currency: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="USD">USD</SelectItem>
                                                                <SelectItem value="EUR">EUR</SelectItem>
                                                                <SelectItem value="GBP">GBP</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Payment Method *</label>
                                                        <Select
                                                            value={paymentForm.paymentMethod}
                                                            onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                                <SelectItem value="cash">Cash</SelectItem>
                                                                <SelectItem value="check">Check</SelectItem>
                                                                <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Payment Date *</label>
                                                        <Input
                                                            type="date"
                                                            value={paymentForm.paymentDate}
                                                            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Received By *</label>
                                                    <Select
                                                        value={paymentForm.receivedBy}
                                                        onValueChange={(value) => setPaymentForm({ ...paymentForm, receivedBy: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select who received the payment" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {users.map((user) => (
                                                                <SelectItem key={user._id} value={user._id}>
                                                                    {user.fullName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Transaction ID</label>
                                                    <Input
                                                        placeholder="Enter transaction ID (optional)"
                                                        value={paymentForm.transactionId}
                                                        onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Description *</label>
                                                    <Textarea
                                                        placeholder="Describe what this payment is for..."
                                                        value={paymentForm.description}
                                                        onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Receipt URL</label>
                                                    <Input
                                                        placeholder="Upload receipt or enter URL (optional)"
                                                        value={paymentForm.receiptUrl}
                                                        onChange={(e) => setPaymentForm({ ...paymentForm, receiptUrl: e.target.value })}
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-4">
                                                    <Button onClick={handleSubmitPayment} disabled={isPending} className="flex-1">
                                                        {isPending ? "Recording..." : "Record Payment"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsPaymentDialogOpen(false)}
                                                        disabled={isPending}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {building.payments?.map((payment: any, index: number) => (
                                                <div key={payment._id || index} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-2xl">{getPaymentMethodIcon(payment.paymentMethod)}</div>
                                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(payment.status)}`} />
                                                        <div>
                                                            <p className="font-medium text-lg">
                                                                ${payment.amount.toLocaleString()} {payment.currency}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{payment.description}</p>
                                                            {payment.transactionId && (
                                                                <p className="text-xs text-gray-500">ID: {payment.transactionId}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">Received by {payment.receivedByName}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(payment.paymentDate).toLocaleDateString()} •{" "}
                                                            {payment.paymentMethod.replace("_", " ")}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={`mt-1 ${getStatusColor(payment.status)} text-white border-0`}
                                                        >
                                                            {payment.status}
                                                        </Badge>
                                                        {payment.receiptUrl && (
                                                            <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto">
                                                                <Receipt className="h-3 w-3 mr-1" />
                                                                Receipt
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )) || <p className="text-center text-gray-500">No payments recorded yet</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="comments" className="space-y-6">
                                {/* Add Comment Button */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">Visitor Reviews ({building.comments?.length || 0})</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Share your experience visiting this building
                                        </p>
                                    </div>
                                    <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Review
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Leave a Review</DialogTitle>
                                                <DialogDescription>Share your experience and feedback about this building</DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                {submitMessage && (
                                                    <Alert>
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>{submitMessage}</AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Your Name *</label>
                                                        <Input
                                                            placeholder="Enter your full name"
                                                            value={commentForm.userName}
                                                            onChange={(e) => setCommentForm({ ...commentForm, userName: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Your Email *</label>
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            value={commentForm.userEmail}
                                                            onChange={(e) => setCommentForm({ ...commentForm, userEmail: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Visit Date</label>
                                                    <Input
                                                        type="date"
                                                        value={commentForm.visitDate}
                                                        onChange={(e) => setCommentForm({ ...commentForm, visitDate: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Rating *</label>
                                                    <div className="flex space-x-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setCommentForm({ ...commentForm, rating: star })}
                                                                className={`w-8 h-8 ${star <= commentForm.rating ? "text-yellow-500" : "text-gray-300"} hover:text-yellow-400 transition-colors`}
                                                            >
                                                                <Star className="w-full h-full fill-current" />
                                                            </button>
                                                        ))}
                                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                            {commentForm.rating} star{commentForm.rating !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Your Review *</label>
                                                    <Textarea
                                                        placeholder="Share your thoughts about this building, construction quality, design, etc..."
                                                        value={commentForm.comment}
                                                        onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Click to upload photos or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-4">
                                                    <Button onClick={handleSubmitComment} disabled={isPending} className="flex-1">
                                                        {isPending ? "Submitting..." : "Submit Review"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsCommentDialogOpen(false)}
                                                        disabled={isPending}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Comments List */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            {building.comments?.map((comment: any, index: number) => (
                                                <div key={comment._id || index} className="border-b pb-6 last:border-b-0">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                                <User className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{comment.userName}</p>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <div className="flex">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star
                                                                                key={star}
                                                                                className={`w-4 h-4 ${star <= comment.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                                                                    }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    {comment.isVerified && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                                            Verified Visit
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                                                            <p>Visited: {new Date(comment.visitDate).toLocaleDateString()}</p>
                                                            <p>Posted: {new Date(comment.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-700 dark:text-gray-300 ml-13 mb-3">{comment.comment}</p>

                                                    {comment.images && comment.images.length > 0 && (
                                                        <div className="ml-13 flex space-x-2">
                                                            {comment.images.map((image, index) => (
                                                                <div key={index} className="w-20 h-20 relative rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={image || "/placeholder.svg"}
                                                                        alt={`Review image ${index + 1}`}
                                                                        fill
                                                                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )) || <p className="text-center text-gray-500">No reviews yet</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="gallery" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Gallery</CardTitle>
                                        <CardDescription>Visual documentation of the building</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {building.imgUrls?.map((image: string, index: number) => (
                                                <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                                                    <Image
                                                        src={image || "/placeholder.svg"}
                                                        alt={`${building.buildingType} view ${index + 1}`}
                                                        fill
                                                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                                                    />
                                                </div>
                                            )) || <p className="text-center text-gray-500">No images available</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button onClick={handleNavigate} className="w-full">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Navigate Here
                                </Button>
                                <Button variant="outline" className="w-full bg-transparent" asChild>
                                    <Link href={`/map?building=${building._id}`}>
                                        <MapPin className="h-4 w-4 mr-2" />
                                        View on Map
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full bg-transparent">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Add Photos
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full bg-transparent"
                                    onClick={() => setIsPaymentDialogOpen(true)}
                                >
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Add Payment
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Client Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Client Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</Label>
                                    <p className="text-sm font-medium">{building.clientCompany || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Person</Label>
                                    <p className="text-sm">{building.clientName}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</Label>
                                    <p className="text-sm">{building.clientEmail}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</Label>
                                    <p className="text-sm">{building.clientPhone}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Project Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</span>
                                    <span className="text-sm font-medium">${(building.totalProjectCost || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Paid Amount:</span>
                                    <span className="text-sm font-medium text-green-600">
                                        ${(building.totalPaidAmount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Remaining:</span>
                                    <span className="text-sm font-medium text-orange-600">
                                        ${(building.remainingBalance || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Payments Made:</span>
                                    <span className="text-sm font-medium">{building.payments?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</Label>
                                    <p className="text-sm">{building.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Latitude</Label>
                                        <Badge variant="secondary" className="w-full justify-center text-xs">
                                            {building.coordinates?.lat?.toFixed(6) || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Longitude</Label>
                                        <Badge variant="secondary" className="w-full justify-center text-xs">
                                            {building.coordinates?.lng?.toFixed(6) || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Capture Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Capture Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Created on:</span>
                                    <span className="ml-2 font-medium">{new Date(building.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Camera className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                                    <span className="ml-2 font-medium">{new Date(building.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>
}
