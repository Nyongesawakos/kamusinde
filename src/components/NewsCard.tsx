import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// News data - in a real application, this would come from a CMS or API
const newsItems = [
  {
    id: 1,
    title: "KBHS Students Excel in National Science Competition",
    excerpt:
      "Our students brought home top honors from the National Science and Engineering Fair, showcasing innovative projects in renewable energy and environmental conservation.",
    category: "Achievements",
    date: "June 15, 2023",
    image: "/assets/games.jpg",
    slug: "students-excel-science-competition",
  },
  {
    id: 2,
    title: "New Computer Lab Facility Inaugurated",
    excerpt:
      "KBHS is proud to announce the opening of our state-of-the-art computer laboratory, equipped with the latest technology to enhance digital literacy among our students.",
    category: "Facilities",
    date: "May 28, 2023",
    image: "/assets/lab.jpg",
    slug: "new-computer-lab-inaugurated",
  },
  {
    id: 3,
    title: "Annual Sports Day Celebrates Athletic Excellence",
    excerpt:
      "The annual KBHS Sports Day was a resounding success, with students competing in various athletic events and showcasing their sporting talents and team spirit.",
    category: "Events",
    date: "April 10, 2023",
    image: "/assets/art.jpg",
    slug: "annual-sports-day-excellence",
  },
];

export default function NewsCard() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Latest News & Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay informed about the latest happenings, achievements, and events
            at KBHS High School.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((news) => (
            <Card
              key={news.id}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={news.image || "/placeholder.svg"}
                  alt={news.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="bg-[#295E4F]/10 text-[#295E4F] hover:bg-[#295E4F]/20"
                  >
                    {news.category}
                  </Badge>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {news.date}
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  {news.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 mt-2">
                  {news.excerpt}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={`/news/${news.slug}`} className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/news">
            <Button className="bg-[#295E4F] hover:bg-[#1f4a3f]">
              View All News
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
