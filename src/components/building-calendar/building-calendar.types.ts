import {IEvent} from "@/service/pecalendar.types";
import {EventContentArg} from "@fullcalendar/core";
import {EventImpl} from "@fullcalendar/core/internal";


export type ValidCalendarType = IEvent['type'] | 'background'

export interface FCEventContentArg<T = EventImpl> extends Omit<EventContentArg, 'event'>{
    event: T
}


export interface FCallEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    className: string[];
    extendedProps: {
        actualStart: Date;
        actualEnd: Date;
        isExtended: boolean;
        source: IEvent;
        type: IEvent['type']
    };
}

export interface FCallTempEvent {
    id: string;
    title: string;
    start: Date | string;
    end: Date | string;
    allDay: boolean
    editable: boolean,
    extendedProps: {
        type: 'temporary',
        resources: string[]
        colours: string[]
    };
}
export interface FCallBackgroundEvent {
    start: Date | string;
    end: Date | string;
    display: 'background'
    classNames: string[];
    extendedProps: {
        type: 'background'
    }
}
