import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data - in a real app, this would come from the database
const events = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "2023-06-15",
    time: "2:00 PM - 5:00 PM",
    location: "Main Hall",
    type: "meeting",
  },
  {
    id: 2,
    title: "End of Term Exams",
    date: "2023-06-20",
    time: "8:00 AM - 4:00 PM",
    location: "All Classrooms",
    type: "exam",
  },
  {
    id: 3,
    title: "Sports Day",
    date: "2023-06-25",
    time: "9:00 AM - 3:00 PM",
    location: "School Grounds",
    type: "sports",
  },
  {
    id: 4,
    title: "Staff Meeting",
    date: "2023-06-16",
    time: "3:30 PM - 4:30 PM",
    location: "Staff Room",
    type: "meeting",
  },
];

const getEventTypeStyles = (type: string) => {
  switch (type) {
    case "meeting":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "exam":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "sports":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function UpcomingEventsList() {
  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming events.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="rounded-lg border p-3">
              <div className="flex flex-col space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={cn("ml-2", getEventTypeStyles(event.type))}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
                <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
