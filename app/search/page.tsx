"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GoogleMaps from "@/components/GoogleMaps";
import EventsPageEvent from "@/components/Events/EventsPageEvent";

interface Event {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  date: string;
}

const SearchResultsPage = () => {
  return (
    <Suspense fallback={<p className="text-center">Loading...</p>}>
      <SearchResults />
    </Suspense>
  );
};

const SearchResults = () => {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const query = searchParams.get("query") || "";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${location}%`);

      if (error) console.error("Error fetching events:", error);
      else setEvents(data || []);

      setLoading(false);
    };

    if (query || location) {
      fetchEvents();
    }
  }, [query, location]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">
        Search results for &quot;{query}&quot; near {location || "your location"}
      </h2>

      {/* Events + Map Section */}
      <div className="flex flex-col sm:flex-row w-full justify-between gap-6">
        {/* Scrollable Events Section (Left) */}
        <div className="flex flex-col gap-4 mt-4 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 w-full sm:w-2/3">
          {loading ? (
            <p className="text-center">Loading events...</p>
          ) : events.length > 0 ? (
            events.map((event) => (
              <EventsPageEvent
                key={event.id}
                id={event.id}
                src={event.image_url || "/images/happy-friends.png"}
                alt={event.name}
                title={event.name}
                description={event.description}
                date={event.date}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No results found.</p>
          )}
        </div>

        {/* Map Section (Right) */}
        <div className="hidden md:block flex-col mt-4 sm:w-1/3">
          <p className="text-md text-gray-700">Events near</p>
          <p className="text-xl font-bold">{location || "your location"}</p>
          <GoogleMaps location={location} />
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
