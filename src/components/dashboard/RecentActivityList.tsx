import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - in a real app, this would come from the database
const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      image: null,
      initials: "JD",
    },
    action: "added a new student",
    target: "Jane Smith",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Sarah Johnson",
      image: null,
      initials: "SJ",
    },
    action: "updated course",
    target: "Mathematics 101",
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Michael Brown",
      image: null,
      initials: "MB",
    },
    action: "marked attendance for",
    target: "Form 3A",
    timestamp: "Yesterday",
  },
  {
    id: 4,
    user: {
      name: "Emily Wilson",
      image: null,
      initials: "EW",
    },
    action: "recorded grades for",
    target: "End Term Exams",
    timestamp: "Yesterday",
  },
  {
    id: 5,
    user: {
      name: "David Lee",
      image: null,
      initials: "DL",
    },
    action: "created event",
    target: "Parent-Teacher Meeting",
    timestamp: "2 days ago",
  },
];

export default function RecentActivityList() {
  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={activity.user.image || undefined}
                  alt={activity.user.name}
                />
                <AvatarFallback className="bg-[#295E4F] text-white text-xs">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  {activity.action}{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
