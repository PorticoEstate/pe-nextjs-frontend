
// File: app/calendar/page.tsx
import { notFound } from 'next/navigation';
import { DateTime } from "luxon";
import CalendarWrapper from '@/components/building-calendar/CalendarWrapper';
import { fetchBuildingSchedule, fetchFreeTimeSlots } from "@/service/api/api-utils";

interface CalendarPageProps {
    searchParams: { building_id?: string };
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
    if (!searchParams.building_id) {
        return notFound();
    }

    const buildingId = parseInt(searchParams.building_id, 10);
    const initialDate = DateTime.now();
    const weeksToFetch = [
        initialDate.startOf('week').toFormat("y-MM-dd"),
        initialDate.startOf('week').plus({ week: 1 }).toFormat("y-MM-dd"),
    ];

    try {
        const [initialSchedule, initialFreeTime] = await Promise.all([
            fetchBuildingSchedule(buildingId, weeksToFetch),
            fetchFreeTimeSlots(buildingId)
        ]);

        return (
            <CalendarWrapper
                initialSchedule={initialSchedule.schedule || []}
                initialFreeTime={initialFreeTime}
                buildingId={buildingId}
                resources={initialSchedule.resources}
                seasons={initialSchedule.seasons}
            />
        );
    } catch (error) {
        console.error('Error fetching initial data:', error);
        return <div>Error loading calendar data. Please try again later.</div>;
    }
};

export default CalendarPage;
