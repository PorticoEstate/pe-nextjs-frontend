// File: components/CalendarWrapper.tsx
'use client'

import React, {useState, useCallback} from 'react';
import {DateTime, Interval} from "luxon";
import BuildingCalendar from "@/components/building-calendar/building-calendar";
import {fetchBuildingSchedule, fetchFreeTimeSlots} from "@/service/api/api-utils";
import {IBuildingResource, IEvent, Season} from "@/service/pecalendar.types";
import {DatesSetArg} from "@fullcalendar/core";

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


    const fetchData = useCallback(async (start: DateTime, end?: DateTime) => {
        setIsLoading(true);
        try {
            const firstDay = start.startOf('week');
            const lastDay = (end || DateTime.now()).endOf('week');

            // Create an interval from start to end
            const dateInterval = Interval.fromDateTimes(firstDay, lastDay);

            // Generate an array of week start dates
            const weeksToFetch = dateInterval.splitBy({ weeks: 1 }).map(interval =>
                interval.start!.toFormat("y-MM-dd")
            );

            // If the array is empty (which shouldn't happen, but just in case),
            // add the start date
            if (weeksToFetch.length === 0) {
                weeksToFetch.push(firstDay.toFormat("y-MM-dd"));
            }

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

    const handleDateChange = (newDate: DatesSetArg) => {
        fetchData(DateTime.fromJSDate(newDate.start), DateTime.fromJSDate(newDate.end));
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
