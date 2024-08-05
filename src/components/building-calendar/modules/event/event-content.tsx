import React from 'react';
import { EventContentArg } from "@fullcalendar/core";

const EventContent = (eventInfo: EventContentArg) => {

    if (!eventInfo.event.extendedProps?.colours) {
        return;
    }

    const {colours} = eventInfo.event.extendedProps;

    const circleStyle: React.CSSProperties = {
        width: '0.625rem',
        height: '0.625rem',
        borderRadius: '50%',
        display: 'inline-block',
        margin: '0 2px',
        // border: '1px solid gray'
    };

    return (
        <div style={{padding: '2px', overflow: 'hidden', color: 'black'}}>
            <div style={{display: "flex", justifyContent: 'space-between'}}>
                <div>{eventInfo.timeText}</div>
                <div style={{display: "flex", flexDirection: 'row-reverse', flexWrap: 'wrap'}}>
                    {colours.map((color, index) => (
                        <span-reverse
                            key={index}
                            style={{...circleStyle, backgroundColor: color}}
                            title={eventInfo.event.extendedProps.resources.split(', ')[index]}
                        />
                    ))}
                </div>
            </div>
            <div>{eventInfo.event.title}</div>

        </div>
    );

};

export default EventContent;
