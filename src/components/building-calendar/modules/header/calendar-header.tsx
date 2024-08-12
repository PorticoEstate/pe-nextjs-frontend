import React, {Dispatch, FC, MutableRefObject} from 'react';
import FullCalendar from "@fullcalendar/react";
import {DateTime} from "luxon";
import styles from './calendar-header.module.scss'
import CalendarDatePicker from "@/components/building-calendar/modules/header/calendar-date-picker";
import {Button} from "@digdir/designsystemet-react";
import {ArrowLeftIcon, ArrowRightIcon, PlusCircleIcon} from "@navikt/aksel-icons";
import ButtonGroup from "@/components/button-group/button-group";

// const CalendarHeader = () => ({
//     left: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek today',
//     center: 'prev title next',
//     right: 'to_booking',
// });


interface CalendarHeaderProps {
    calendarRef: MutableRefObject<FullCalendar | undefined>;
    setView: Dispatch<string>;
    view: string;
}

const CalendarHeader: FC<CalendarHeaderProps> = (props) => {
    const {calendarRef, setView, view} = props;
    const c = calendarRef.current;
    if (!c) {
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
        },
        list: {
            text: 'List',
            click: () => setView('listWeek')
        }
    };
    return (
        <div className={styles.customHeader}>

            {/*<ButtonGroup aria-label="outlined primary button group">*/}
            <ButtonGroup>
                <Button  variant={view === 'timeGridDay' ? 'primary': 'secondary'} size={'sm'}
                        onClick={() => customButtons.dayView.click()}>Day</Button>
                <Button variant={view === 'timeGridWeek' ? 'primary': 'secondary'} size={'sm'}
                        onClick={() => customButtons.weekView.click()}>Week</Button>
                <Button variant={view === 'dayGridMonth' ? 'primary': 'secondary'} size={'sm'}
                        onClick={() => customButtons.monthView.click()}>Month</Button>

            </ButtonGroup>
            {/*</ButtonGroup>*/}

            {/*<IconButton color="primary" variant="outlined" size="medium" aria-label="prev" onClick={() => customButtons.prevButton.click()} component="span">*/}
            {/*    {'<'}*/}
            {/*</IconButton>*/}
            <Button  size={'sm'} icon={true} color='second' variant='secondary' style={{borderRadius: "50%"}} onClick={() => customButtons.prevButton.click()}
                    aria-label='Tertiary med ikon'>
                <ArrowLeftIcon fontSize='1.5rem'/>
            </Button>
            <CalendarDatePicker currentDate={currentDate} view={c.getApi().view.type}
                                onDateChange={(v) => console.log(v)}/>

            <Button icon={true} size={'sm'} color='second' style={{borderRadius: "50%"}} variant='secondary' onClick={() => customButtons.nextButton.click()}
                    aria-label='Tertiary med ikon'>
                <ArrowRightIcon fontSize='1.5rem'/>
            </Button>


            {/*<span>{DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}</span>*/}

            <button onClick={() => customButtons.list.click()}>List</button>
        </div>
    );
};

export default CalendarHeader;
