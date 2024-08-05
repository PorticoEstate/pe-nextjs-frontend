import React, {Dispatch, FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DateTime, Settings} from 'luxon'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {IBuildingResource, IEvent, Season} from "@/service/pecalendar.types";
import {EventClickArg, EventInput} from "@fullcalendar/core";
import styles from './building-calender.module.scss'
import {useColours} from "@/service/hooks/Colours";
import {EventImpl} from "@fullcalendar/core/internal";
import {FCallEventConverter} from "@/components/building-calendar/util/event-converter";
import CalendarResourceFilter, {
    CalendarResourceFilterOption
} from "@/components/building-calendar/modules/calender-resource-filter";
import EventContent from "@/components/building-calendar/modules/event/event-content";
import CalendarHeader from "@/components/building-calendar/modules/calendar-header";
import EventPopper from "@/components/building-calendar/modules/event/event-popper";

interface BuildingCalendarProps {
    events: IEvent[];
    resources: Record<string, IBuildingResource>;
    onDateChange: Dispatch<Date>
    seasons: Season[];  // Add this line
}

Settings.defaultLocale = "nb";


const CircleIcon: FC<{ color: string }> = ({color}) => (
    <span style={{
        display: 'inline-block',
        width: '0.8rem',
        height: '0.8rem',
        borderRadius: '50%',
        backgroundColor: color,
        marginLeft: '0.5rem',
    }}/>
);


const BuildingCalendar: FC<BuildingCalendarProps> = (props) => {
    const {events} = props;
    const [currentDate, setCurrentDate] = useState<DateTime>(DateTime.now());
    const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
    const colours = useColours();
    const [slotMinTime, setSlotMinTime] = useState('00:00:00');
    const [slotMaxTime, setSlotMaxTime] = useState('24:00:00');
    const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
    const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLElement | null>(null);
    const calendarRef = useRef<FullCalendar>();


    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
        // Check if the clicked event is a background event
        if (clickInfo.event.display === 'background') {
            // Do not open popper for background events
            return;
        }

        // Check if the event is a valid, interactive event
        if (clickInfo.event.id) {
            setSelectedEvent(clickInfo.event);
            setPopperAnchorEl(clickInfo.el);
        }
    }, []);


    const calculateAbsoluteMinMaxTimes = useCallback(() => {
        let minTime = '24:00:00';
        let maxTime = '00:00:00';
        // Check seasons
        props.seasons.forEach(season => {
            if (season.from_ < minTime) minTime = season.from_;
            if (season.to_ > maxTime) maxTime = season.to_;
        });

        // Check events
        events.forEach(event => {
            if (event.from < minTime) minTime = event.from;
            if (event.to > maxTime) maxTime = event.to;
        });


        console.log(minTime, maxTime)
        setSlotMinTime(minTime === "24:00:00" ? '06:00:00' : minTime);
        setSlotMaxTime(maxTime === "00:00:00" ? '24:00:00' : maxTime);
    }, [props.seasons, events]);

    useEffect(() => {
        calculateAbsoluteMinMaxTimes();
    }, [calculateAbsoluteMinMaxTimes]);


    const renderBackgroundEvents = useCallback(() => {
        const backgroundEvents: EventInput[] = [];
        const startDate = currentDate.startOf('week');
        const endDate = startDate.plus({weeks: 4});

        for (let date = startDate; date < endDate; date = date.plus({days: 1})) {
            const dayOfWeek = date.weekday;
            const season = props.seasons.find(s => s.wday === dayOfWeek);

            if (season) {
                // Add background event for time before opening
                backgroundEvents.push({
                    start: date.toFormat("yyyy-MM-dd'T00:00:00'"),
                    end: date.toFormat(`yyyy-MM-dd'T${season.from_}'`),
                    display: 'background',
                    classNames: styles.closedHours
                });

                // Add background event for time after closing
                backgroundEvents.push({
                    start: date.toFormat(`yyyy-MM-dd'T${season.to_}'`),
                    end: date.plus({days: 1}).toFormat("yyyy-MM-dd'T00:00:00'"),
                    display: 'background',
                    classNames: styles.closedHours
                });
            }
        }

        return backgroundEvents;
    }, [currentDate, props.seasons]);

    const resourceToIds = useMemo(() => {
        return Object.values(props.resources).map(res => res.id).reduce((coll, curr, indx) => {
            return {[curr]: indx, ...coll}
        }, {})
    }, [props.resources])

    const resourceOptions = useMemo<CalendarResourceFilterOption[]>(() => {
        return Object.values(props.resources).map((resource, index) => ({
            value: resource.id.toString(),
            label: resource.name,
            color: colours?.[index % colours.length]
        }));
    }, [props.resources, colours]);

    const [enabledResources, setEnabledResources] = useState<Set<string>>(
        new Set(resourceOptions.map(option => option.value))
    );

    useEffect(() => {
        if (!colours || !resourceToIds) {
            return;
        }
        const filteredEvents = events
            .map((e) => FCallEventConverter(e, colours, resourceToIds, enabledResources))
            .filter((e): e is EventInput => e !== null);
        setCalendarEvents(filteredEvents);
    }, [events, colours, resourceToIds, enabledResources]);

    const handleResourceToggle = (resourceId: string) => {
        setEnabledResources(prevEnabled => {
            const newEnabled = new Set(prevEnabled);
            if (newEnabled.has(resourceId)) {
                newEnabled.delete(resourceId);
            } else {
                newEnabled.add(resourceId);
            }
            return newEnabled;
        });
    };

    const handleToggleAll = () => {
        if (enabledResources.size === resourceOptions.length) {
            setEnabledResources(new Set());
        } else {
            setEnabledResources(new Set(resourceOptions.map(option => option.value)));
        }
    };




    return (
        <div className={styles.calendar}>
            <CalendarHeader calendarRef={calendarRef} setView={(v) => console.log(v)} />
            <CalendarResourceFilter
                resourceOptions={resourceOptions}
                enabledResources={enabledResources}
                onToggle={handleResourceToggle}
                onToggleAll={handleToggleAll}
            />
            <FullCalendar
                ref={calendarRef}
                plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                initialView="timeGridWeek"
                slotMinTime={slotMinTime}
                slotMaxTime={slotMaxTime}
                headerToolbar={false}

                themeSystem={'bootstrap'}
                firstDay={1}
                eventClick={handleEventClick}
                datesSet={(dateInfo) => {
                    props.onDateChange(dateInfo.start);
                }}
                eventContent={EventContent}
                views={{
                    timeGrid: {
                        slotLabelFormat: {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }
                    },
                    list: {
                        eventClassNames: ({event: {extendedProps}}) => {
                            return `clickable ${
                                extendedProps.cancelled ? 'event-cancelled' : ''
                            }`
                        },
                    },
                    month: {
                        eventTimeFormat: {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        },
                    },
                }}
                dayHeaderFormat={{weekday: 'long'}}
                dayHeaderContent={(args) => (
                    <div className={styles.dayHeader}>
                        <div>{args.date.toLocaleDateString('nb-NO', {weekday: 'long'})}</div>
                        <div>{args.date.getDate()}</div>
                    </div>
                )}
                weekNumbers={true}
                weekText="Uke "
                locale={DateTime.local().locale}
                events={[...calendarEvents, ...renderBackgroundEvents()]}
                initialDate={currentDate.toJSDate()}
            />

            <EventPopper event={selectedEvent}
                         placement={['timeGridDay', 'listWeek'].includes(calendarRef.current?.calendar.currentData.viewSpec.type) ? 'bottom-start' : "right-start"}
                         anchor={popperAnchorEl} onClose={() => {
                setSelectedEvent(null);
                setPopperAnchorEl(null);
            }} />
        </div>
    );
}

export default BuildingCalendar;
