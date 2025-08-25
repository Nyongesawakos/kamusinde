import Image from "next/image"; // Use Next.js Image
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use Shadcn Card

// Assuming Alumni2 image is in public/assets
const alumniImage = "/assets/alumni2.jpg";

const events = [
  {
    title: "Alumni Reunion Gala",
    description: "Reconnect and celebrate with old friends and teachers.",
    date: "November 25, 2024",
    imageUrl: alumniImage,
  },
  {
    title: "Career Networking Event",
    description: "A great opportunity to share and gain professional advice.",
    date: "January 15, 2025",
    imageUrl: alumniImage,
  },
  {
    title: "Alumni Sports Day",
    description: "Relive the glory days with fun and friendly games.",
    date: "March 10, 2025",
    imageUrl: alumniImage,
  },
];

const AlumniEvents = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {" "}
      {/* Replaced styles.container */}
      <section className="mb-12">
        {" "}
        {/* Replaced styles.section */}
        <h2 className="text-center text-black mb-10 font-bold text-4xl md:text-5xl">
          {" "}
          {/* Replaced styles.sectionTitle */}
          Alumni Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {" "}
          {/* Replaced styles.cardGrid */}
          {events.map((event, index) => (
            <Card
              key={index}
              className="bg-card overflow-hidden shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            >
              {" "}
              {/* Replaced styles.card */}
              <div className="relative w-full h-48">
                {" "}
                {/* Container for Image */}
                <Image
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                  className="transition-opacity duration-300 group-hover:opacity-90" // Optional effect
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {event.title}
                </CardTitle>{" "}
                {/* Replaced styles.eventTitle */}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {event.description}
                </p>{" "}
                {/* Replaced styles.eventDescription */}
                <p className="text-xs text-gray-500">{event.date}</p>{" "}
                {/* Replaced styles.eventDate */}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AlumniEvents;
