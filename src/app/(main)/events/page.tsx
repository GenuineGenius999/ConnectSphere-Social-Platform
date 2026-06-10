import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEvents } from "@/lib/queries/social";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Events</h1>
          <p className="text-muted-foreground">Discover events near you</p>
        </div>
        <Button>Create Event</Button>
      </div>

      <Input placeholder="Search events..." className="max-w-md" />

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden border-border/40 hover:shadow-lg transition-shadow group">
            <div className="relative h-44 bg-muted">
              {event.image && (
                <Image src={event.image} alt={event.title} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                <p className="text-xs font-bold text-primary">{event.date.split(" ")[0]}</p>
                <p className="text-lg font-bold leading-none">{event.date.split(" ")[1]?.replace(",", "")}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <div className="space-y-1.5 mt-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{event.date}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.location}</p>
                <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />{event.attendees} going</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">Interested</Button>
                <Button size="sm" variant="outline" className="flex-1">Share</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
