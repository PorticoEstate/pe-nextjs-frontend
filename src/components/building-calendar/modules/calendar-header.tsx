import React, {Dispatch, FC, MutableRefObject} from 'react';
import FullCalendar from "@fullcalendar/react";
import {DateTime} from "luxon";
import styles from './calendar-header.module.scss'

// const CalendarHeader = () => ({
//     left: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek today',
//     center: 'prev title next',
//     right: 'to_booking',
// });


interface CalendarHeaderProps {
    calendarRef: MutableRefObject<FullCalendar | undefined>;
    setView: Dispatch<string>;
}

const CalendarHeader: FC<CalendarHeaderProps> = (props) => {
    const {calendarRef, setView} = props;
    const c = calendarRef.current;
    if(!c) {
        return null;
    }
    const calendarApi = c.getApi();
    const currentDate = calendarApi ? calendarApi.getDate() : new Date();

    const customButtons = {
        prevButton: {
            text: 'Prev',
            click: () => {
                if (c) {
                    calendarApi.prev();
                }
            }
        },
        nextButton: {
            text: 'Next',
            click: () => {
                if (c) {
                    calendarApi.next();
                }
            }
        },
        dayView: {
            text: 'Day',
            click: () => setView('timeGridDay')
        },
        weekView: {
            text: 'Week',
            click: () => setView('timeGridWeek')
        },
        monthView: {
            text: 'Month',
            click: () => setView('dayGridMonth')
        }
    };
    return (
        <div className={styles.customHeader}>
            <button onClick={() => customButtons.prevButton.click()}>Prev</button>
            <button onClick={() => customButtons.nextButton.click()}>Next</button>
            <span>{DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}</span>
            <button onClick={() => customButtons.dayView.click()}>Day</button>
            <button onClick={() => customButtons.weekView.click()}>Week</button>
            <button onClick={() => customButtons.monthView.click()}>Month</button>
        </div>
    );
};

export default CalendarHeader;
