"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createActivity } from "@/lib/actions/activity.actions";

const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  scheduledDate: z.date({
    required_error: "Scheduled date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  buildingId: z.string().min(1, "Building is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  estimatedDuration: z.number().min(1, "Duration must be at least 1 minute"),
  estimatedCost: z.number().optional(),
  requiredTools: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  safetyRequirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isEmergency: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  reminderSet: z.boolean().default(false),
  reminderTime: z.date().optional(),
  tags: z.array(z.string()).optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface Building {
  _id: string;
  buildingType: string;
  address: string;
  clientName: string;
}

interface CreateActivityDialogProps {
  buildings: Building[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateActivityDialog({
  buildings,
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateActivityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newTool, setNewTool] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newSafety, setNewSafety] = useState("");
  const [newTag, setNewTag] = useState("");

  const form = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      priority: "medium",
      estimatedDuration: 60,
      estimatedCost: 0,
      requiredTools: [],
      requiredSkills: [],
      safetyRequirements: [],
      notes: "",
      isEmergency: false,
      requiresApproval: false,
      reminderSet: false,
      tags: [],
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    setLoading(true);
    try {
      // Calculate end time if not provided
      if (data.startTime && data.estimatedDuration) {
        const [hours, minutes] = data.startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + data.estimatedDuration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        data.endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      }

      const activityData = {
        ...data,
        scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
        reminderTime: data.reminderTime ? format(data.reminderTime, 'yyyy-MM-dd') : undefined,
        assignedTo: [], // Will be handled by assignment system
      };

      // Call createActivity server action
      await createActivity(activityData, window.location.pathname);

      toast.success("Activity created successfully!");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("Failed to create activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: keyof ActivityFormData, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;

    const currentValues = form.getValues(field) as string[] || [];
    if (!currentValues.includes(value.trim())) {
      form.setValue(field, [...currentValues, value.trim()]);
    }
    setter("");
  };

  const removeArrayItem = (field: keyof ActivityFormData, index: number) => {
    const currentValues = form.getValues(field) as string[] || [];
    form.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
          <DialogDescription>
            Schedule a new activity for workers to complete
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., HVAC System Inspection" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="routine_check">Routine Check</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the activity..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Location and Building */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buildingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select building" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building._id} value={building._id}>
                              {building.buildingType} - {building.clientName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Floor 3, Room 301" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Schedule</h3>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Priority and Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Priority & Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="isEmergency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Emergency Activity
                        </FormLabel>
                        <FormDescription>
                          Mark as emergency for immediate attention
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires Approval</FormLabel>
                        <FormDescription>
                          Activity needs approval before starting
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements</h3>

              {/* Required Tools */}
              <div>
                <FormLabel>Required Tools</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add tool..."
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('requiredTools', newTool, setNewTool);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('requiredTools', newTool, setNewTool)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.watch('requiredTools') || []).map((tool, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tool}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('requiredTools', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <FormLabel>Required Skills</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('requiredSkills', newSkill, setNewSkill);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('requiredSkills', newSkill, setNewSkill)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.watch('requiredSkills') || []).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('requiredSkills', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Safety Requirements */}
              <div>
                <FormLabel>Safety Requirements</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add safety requirement..."
                    value={newSafety}
                    onChange={(e) => setNewSafety(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('safetyRequirements', newSafety, setNewSafety);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('safetyRequirements', newSafety, setNewSafety)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.watch('safetyRequirements') || []).map((safety, index) => (
                    <Badge key={index} variant="destructive" className="gap-1">
                      {safety}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('safetyRequirements', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or instructions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div>
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('tags', newTag, setNewTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('tags', newTag, setNewTag)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.watch('tags') || []).map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeArrayItem('tags', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Activity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}