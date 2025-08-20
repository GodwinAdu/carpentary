"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  BookOpen,
  Video,
  FileText,
  Users,
  Settings,
  MapPin,
  Building2,
  CreditCard,
  Shield,
  Zap,
  Send
} from "lucide-react"
import { useState } from "react"

export function SupportContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const supportCategories = [
    { id: "all", label: "All Topics", icon: HelpCircle },
    { id: "building", label: "Building Management", icon: Building2 },
    { id: "tracking", label: "Live Tracking", icon: MapPin },
    { id: "payments", label: "Payments & Billing", icon: CreditCard },
    { id: "account", label: "Account & Settings", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
  ]

  const faqData = [
    {
      category: "building",
      question: "How do I add a new building project?",
      answer: "Navigate to Dashboard > Building Tracking > Manage Buildings. Click 'Add New Building' and fill in the required details including location, client information, and project specifications."
    },
    {
      category: "building",
      question: "Can I track payment progress for each building project?",
      answer: "Yes, each building project includes comprehensive payment tracking. You can view total project cost, paid amounts, remaining balance, and payment history in the building details page."
    },
    {
      category: "tracking",
      question: "How does the live tracking feature work?",
      answer: "The live tracking system uses GPS coordinates to monitor real-time locations of team members and project sites. Access it through the 'Live Tracking' menu to see active locations on the map."
    },
    {
      category: "tracking",
      question: "Can I set up geofencing alerts?",
      answer: "Yes, you can configure location-based alerts and notifications for when team members enter or leave specific project sites through the tracking controls panel."
    },
    {
      category: "payments",
      question: "What payment methods are supported?",
      answer: "We support multiple payment methods including cash, mobile money, bank transfers, credit cards, checks, and digital wallets. All payments are tracked with transaction IDs and receipts."
    },
    {
      category: "payments",
      question: "How do I generate payment reports?",
      answer: "Go to Dashboard > Reports and select from various payment-related reports including Profit/Loss, Register Reports, and custom financial analytics."
    },
    {
      category: "account",
      question: "How do I manage user roles and permissions?",
      answer: "Navigate to Dashboard > HR and Payroll > Roles to create and manage different user roles with specific permissions for building management, tracking, and financial operations."
    },
    {
      category: "account",
      question: "Can I customize the dashboard layout?",
      answer: "The dashboard automatically adapts to your role and permissions. Contact support for advanced customization options specific to your business needs."
    },
    {
      category: "security",
      question: "Is my building and client data secure?",
      answer: "Yes, we use enterprise-grade encryption and security measures. All sensitive data including client information, financial records, and location data is protected with industry-standard security protocols."
    },
    {
      category: "security",
      question: "How often should I backup my project data?",
      answer: "Data is automatically backed up daily. For critical projects, we recommend exporting important data weekly through the Reports section."
    }
  ]

  const quickActions = [
    {
      title: "Add New Building",
      description: "Start tracking a new construction project",
      icon: Building2,
      action: "/dashboard/buildings/manage-building",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "View Live Map",
      description: "Monitor real-time team locations",
      icon: MapPin,
      action: "/live-map",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Generate Report",
      description: "Create financial and project reports",
      icon: FileText,
      action: "/dashboard/report",
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Manage Team",
      description: "Add staff and assign roles",
      icon: Users,
      action: "/dashboard/hr/staffs",
      color: "from-amber-500 to-orange-500"
    }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Mon-Fri 8AM-6PM EST",
      contact: "+1 (555) 123-4567",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Response within 24 hours",
      contact: "support@gmlroofing.com",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Available during business hours",
      contact: "Start Chat",
      color: "from-purple-500 to-violet-500"
    }
  ]

  const filteredFAQs = faqData.filter(faq => 
    (selectedCategory === "all" || faq.category === selectedCategory) &&
    (searchQuery === "" || 
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
            <p className="text-slate-600">Get help with GML Roofing Systems platform</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <CardContent className="p-4 text-center space-y-3">
                  <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{action.title}</h3>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Support Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {supportCategories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Badge>
                ))}
              </div>

              {/* FAQ Accordion */}
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No FAQs found matching your search criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Getting Started Guide
                </CardTitle>
                <CardDescription>Learn the basics of using GML Roofing Systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Setting up your account and profile</li>
                  <li>• Adding your first building project</li>
                  <li>• Understanding the dashboard</li>
                  <li>• Managing team members and roles</li>
                </ul>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Read Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-500" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>Step-by-step video walkthroughs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Building Management Walkthrough</li>
                  <li>• Live Tracking Setup</li>
                  <li>• Payment Processing Tutorial</li>
                  <li>• Generating Reports</li>
                </ul>
                <Button variant="outline" className="w-full">
                  <Video className="h-4 w-4 mr-2" />
                  Watch Videos
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  Building Management
                </CardTitle>
                <CardDescription>Complete guide to project tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Creating and managing projects</li>
                  <li>• Client information management</li>
                  <li>• Payment tracking and invoicing</li>
                  <li>• Project status updates</li>
                </ul>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Live Tracking Guide
                </CardTitle>
                <CardDescription>Master the real-time tracking features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Setting up GPS tracking</li>
                  <li>• Monitoring team locations</li>
                  <li>• Configuring alerts and notifications</li>
                  <li>• Analyzing location data</li>
                </ul>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contact Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Get in Touch</h3>
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${method.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{method.title}</h4>
                        <p className="text-sm text-slate-600">{method.description}</p>
                        <p className="text-sm font-medium text-slate-900">{method.contact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-800">Business Hours</span>
                  </div>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Emergency support only</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>We'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <Input placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Subject</label>
                    <Input placeholder="How can we help you?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Message</label>
                    <Textarea 
                      placeholder="Please describe your issue or question in detail..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}