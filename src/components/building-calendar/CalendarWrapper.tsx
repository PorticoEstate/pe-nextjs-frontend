// File: components/CalendarWrapper.tsx
'use client'

import React, {useState, useCallback} from 'react';
import {DateTime} from "luxon";
import BuildingCalendar from "@/components/building-calendar/building-calendar";
import {fetchBuildingSchedule, fetchFreeTimeSlots} from "@/service/api/api-utils";
import {IBuildingResource, IEvent, Season} from "@/service/pecalendar.types";

interface CalendarWrapperProps {
    initialSchedule: IEvent[];
    initialFreeTime: any; // Replace 'any' with the correct type
    buildingId: number;
    resources: Record<string, IBuildingResource>;
    seasons: Season[]
}

const CalendarWrapper: React.FC<CalendarWrapperProps> = ({
                                                             initialSchedule,
                                                             initialFreeTime,
                                                             buildingId,
                                                             resources,
                                                             seasons
                                                         }) => {
    const [schedule, setSchedule] = useState<IEvent[]>(initialSchedule);
    const [freeTime, setFreeTime] = useState(initialFreeTime);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async (date: DateTime) => {
        setIsLoading(true);
        try {
            const firstDay = date.startOf('week');
            const weeksToFetch = [
                firstDay.toFormat("y-MM-dd"),
                firstDay.plus({week: 1}).toFormat("y-MM-dd"),
            ];

            const [newSchedule, newFreeTime] = await Promise.all([
                fetchBuildingSchedule(buildingId, weeksToFetch),
                fetchFreeTimeSlots(buildingId)
            ]);

            setSchedule(newSchedule.schedule || []);
            setFreeTime(newFreeTime);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsLoading(false);
        }
    }, [buildingId]);

    const handleDateChange = (newDate: Date) => {
        console.log("New date", newDate)
        fetchData(DateTime.fromJSDate(newDate));
    };

    return (
        <div>
            {isLoading && <div>Loading...</div>}
            <BuildingCalendar
                events={schedule}
                onDateChange={handleDateChange}
                resources={resources}
                seasons={seasons}
            />
        </div>
    );
};

export default CalendarWrapper;
