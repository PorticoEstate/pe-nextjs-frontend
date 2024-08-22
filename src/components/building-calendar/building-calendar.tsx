import React, {Dispatch, FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DateTime, Settings} from 'luxon'
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, {EventResizeDoneArg} from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {IBuildingResource, IEvent, Season} from "@/service/pecalendar.types";
import {DateSelectArg, DatesSetArg, EventClickArg} from "@fullcalendar/core";
import styles from './building-calender.module.scss'
import {useColours} from "@/service/hooks/Colours";
import {FCallEventConverter} from "@/components/building-calendar/util/event-converter";
import CalendarResourceFilter, {
    CalendarResourceFilterOption
} from "@/components/building-calendar/modules/calender-resource-filter";
import EventContent from "@/components/building-calendar/modules/event/event-content";
import CalendarHeader from "@/components/building-calendar/modules/header/calendar-header";
import EventPopper from "@/components/building-calendar/modules/event/event-popper";
import CalendarInnerHeader from "@/components/building-calendar/modules/header/calendar-inner-header";
import {usePopperData} from "@/service/api/event-info";
import {
    FCallBackgroundEvent,
    FCallEvent,
    FCallTempEvent,
    FCEventContentArg
} from "@/components/building-calendar/building-calendar.types";
import CalendarProvider from "@/components/building-calendar/calendar-context";

interface BuildingCalendarProps {
    events: IEvent[];
    resources: Record<string, IBuildingResource>;
    onDateChange: Dispatch<DatesSetArg>
    seasons: Season[];  // Add this line
}

Settings.defaultLocale = "nb";


const BuildingCalendar: FC<BuildingCalendarProps> = (props) => {
    const {events} = props;
    const [currentDate, setCurrentDate] = useState<DateTime>(DateTime.now());
    const [calendarEvents, setCalendarEvents] = useState<FCallEvent[]>([]);
    const colours = useColours();
    const [slotMinTime, setSlotMinTime] = useState('00:00:00');
    const [slotMaxTime, setSlotMaxTime] = useState('24:00:00');
    const [selectedEvent, setSelectedEvent] = useState<FCallEvent | null>(null);
    const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLElement | null>(null);
    const calendarRef = useRef<FullCalendar>();
    const [view, setView] = useState<string>('timeGridWeek');
    const [resourcesHidden, setSResourcesHidden] = useState<boolean>(false);
    const [resourcesContainerRendered, setResourcesContainerRendered] = useState<boolean>(true)
    const [lastCalendarView, setLastCalendarView] = useState<string>('timeGridWeek');
    const [tempEvents, setTempEvents] = useState<Record<string, FCallTempEvent>>({});
    const eventInfos = usePopperData(
        events.filter(e => e.type === 'event').map(e => e.id),
        events.filter(e => e.type === 'allocation').map(e => e.id),
        events.filter(e => e.type === 'booking').map(e => e.id)
    );


    useEffect(() => {
        if (view === 'listWeek') {
            return;
        }
        if (view === lastCalendarView) {
            return;
        }
        setLastCalendarView(view)

    }, [view, lastCalendarView]);


    const setResourcesHidden = (v) => {
        if (!v) {
            setResourcesContainerRendered(true);
        }
        setSResourcesHidden(v)
    }

    const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
        const resource = Object.values(props.resources)[0]; // Default to first resource
        const title = 'New Application';
        const newEvent: FCallTempEvent = {
            id: `temp-${Date.now()}`,
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
            editable: true,
            extendedProps: {
                type: 'temporary',
                resources: [resource.id.toString()],
                colours: [colours?.[0] || '#000000'],
            },
        };
        setTempEvents(prev => ({...prev, [newEvent.id]: newEvent}));
        selectInfo.view.calendar.unselect(); // Clear selection
    }, [props.resources, colours]);


    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
        // Check if the clicked event is a background event
        if (clickInfo.event.display === 'background') {
            // Do not open popper for background events
            return;
        }

        // Check if the event is a valid, interactive event
        if (clickInfo.event.id) {
            console.log(clickInfo)
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


        setSlotMinTime(minTime === "24:00:00" ? '06:00:00' : minTime);
        setSlotMaxTime(maxTime === "00:00:00" ? '24:00:00' : maxTime);
    }, [props.seasons, events]);

    useEffect(() => {
        calculateAbsoluteMinMaxTimes();
    }, [calculateAbsoluteMinMaxTimes]);


    const renderBackgroundEvents = useCallback(() => {
        const backgroundEvents: FCallBackgroundEvent[] = [];
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
    const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
        if (resizeInfo.event.extendedProps?.type === 'temporary') {
            setTempEvents(prev => ({
                ...prev,
                [resizeInfo.event.id]: {
                    ...prev[resizeInfo.event.id],
                    start: resizeInfo.event.start as Date,
                    end: resizeInfo.event.end as Date
                }
            }))

        }

    }, []);

    const tempEventArr = useMemo(() => Object.values(tempEvents), [tempEvents])

    useEffect(() => {
        if (!colours || !resourceToIds) {
            return;
        }
        const filteredEvents = events
            .map((e) => FCallEventConverter(e, colours, resourceToIds, enabledResources)!)
        // .filter((e): e is EventInput => e !== null);
        setCalendarEvents(filteredEvents);
    }, [events, colours, resourceToIds, enabledResources]);

    useEffect(() => {
        calendarRef?.current?.getApi().changeView(view)
    }, [view]);

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

    // const handleBeforeTransition = () => {
    //     console.log('Before transition starts');
    //     Perform an action before the transition
    // };

    const handleAfterTransition = () => {
        console.log('After transition ends');
        if (resourcesHidden) {
            setResourcesContainerRendered(false);
        }
    };
    return (
        <CalendarProvider resourceToIds={resourceToIds}>
            <div className={`${styles.calendar} ${resourcesHidden ? styles.closed : ''} `}
                // onTransitionStart={handleBeforeTransition}
                 onTransitionEnd={handleAfterTransition}>
                <CalendarHeader view={view} calendarRef={calendarRef} setView={(v) => setView(v)}/>
                <CalendarResourceFilter
                    hidden={!resourcesContainerRendered}
                    resourceOptions={resourceOptions}
                    enabledResources={enabledResources}
                    onToggle={handleResourceToggle}
                    onToggleAll={handleToggleAll}
                />
                <CalendarInnerHeader view={view} resourcesHidden={resourcesHidden}
                                     setResourcesHidden={setResourcesHidden}
                                     calendarRef={calendarRef} setView={(v) => setView(v)}
                                     setLastCalendarView={() => setView(lastCalendarView)}/>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                    initialView={view}
                    slotMinTime={slotMinTime}
                    slotMaxTime={slotMaxTime}
                    headerToolbar={false}
                    slotDuration={"00:30:00"}
                    themeSystem={'bootstrap'}
                    firstDay={1}
                    eventClick={handleEventClick}
                    datesSet={(dateInfo) => {
                        props.onDateChange(dateInfo);
                    }}
                    eventContent={(eventInfo: FCEventContentArg<FCallEvent>) => <EventContent eventInfo={eventInfo}
                                                                                              infoData={eventInfos?.data?.[eventInfo.event.extendedProps?.source?.type]?.[eventInfo.event.id]}/>}
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
                    selectable={true}
                    eventMaxStack={4}
                    select={handleDateSelect}
                    events={[...calendarEvents, ...tempEventArr, ...renderBackgroundEvents()]}
                    // editable={true}
                    eventResize={handleEventResize}
                    eventDrop={handleEventResize}
                    initialDate={currentDate.toJSDate()}
                    // style={{gridColumn: 2}}
                />

                <EventPopper
                    popperInfo={eventInfos?.data?.[selectedEvent?.extendedProps.source.type]?.[selectedEvent?.id]}
                    event={selectedEvent}
                    placement={['timeGridDay', 'listWeek'].includes(calendarRef.current?.calendar.currentData.viewSpec.type) ? 'bottom-start' : "right-start"}
                    anchor={popperAnchorEl} onClose={() => {
                    setSelectedEvent(null);
                    setPopperAnchorEl(null);
                }}/>
            </div>
        </CalendarProvider>
    );
}

export default BuildingCalendar;
