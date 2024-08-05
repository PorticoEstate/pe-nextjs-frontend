import { EventInput } from "@fullcalendar/core";
import { IEvent } from "@/service/pecalendar.types";
import {DateTime} from "luxon";
import styles from "@/components/building-calendar/building-calender.module.scss";
import {ex} from "@fullcalendar/core/internal-common";

export function FCallEventConverter(event: IEvent, colours: Array<string>, resourceToIds: Record<number, number>, enabledResources: Set<string>): EventInput | null {
    const is_public = 'is_public' in event ? event.is_public : 1;
    const resourceColours = event.resources
        .filter(resource => enabledResources.has(resource.id.toString()))
        .map(a => colours[resourceToIds[a.id] % colours.length]);

    // If no enabled resources for this event, return null
    if (resourceColours.length === 0) return null;

    return {
        id: event.id,
        title: (is_public === 1 ? event.name : 'Private Event') + ` \n${event.type}`,
        start: DateTime.fromISO(`${event.date}T${event.from}`).toJSDate(),
        end: DateTime.fromISO(`${event.date}T${event.to}`).toJSDate(),
        className: [`${styles[`event-${event.type}`]} ${styles.event}`],
        extendedProps: {
            type: event.type,
            resources: event.resources.map(resource => resource.name).join(', '),
            colours: resourceColours
        },
    };
}
