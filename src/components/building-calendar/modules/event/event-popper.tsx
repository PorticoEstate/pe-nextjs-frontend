import React, {FC} from 'react';
import styles from './event-popper.module.scss';
import ClickAwayListener from "@mui/material/ClickAwayListener";
import {Popper} from "@mui/material";
import {Placement} from "@popperjs/core";
import {EventImpl} from "@fullcalendar/core/internal";
import {EventInput} from "@fullcalendar/core";

interface EventPopperProps {
    event: EventImpl | null;
    anchor: HTMLElement | null;
    placement: Placement
    onClose: () => void;
}

const EventPopper: FC<EventPopperProps> = ({event, anchor, onClose, placement}) => {
    // ... (EventPopper component logic)
    if(!event || !anchor) {
        return null;
    }

    const userCanEdit = () => {
        // This function should return whether the current user can edit the event
        // You might need to implement user authentication and check permissions
        return event.extendedProps?.userCanEdit || false;
    };


    return (
        // <div className={styles.eventPopper}>
            <ClickAwayListener onClickAway={onClose}>
                <Popper open={Boolean(event)} anchorEl={anchor}
                        placement={placement}
                        style={{zIndex: 100}}>
                    <div className={styles.eventPopper}>
                        <div className={styles.eventPopperHeader}>
                            <h3>{event.title}</h3>
                            <button onClick={onClose}>&times;</button>
                        </div>
                        <div className={styles.eventPopperContent}>
                            <p>Type: {event.extendedProps?.type}</p>
                            <p>Resources: {event.extendedProps?.resources}</p>
                            <p>Time: {event.start?.toLocaleTimeString()} - {event.end?.toLocaleTimeString()}</p>
                            {(event.extendedProps?.participant_limit || 0) > 0 && (
                                <p>Participant Limit: {event.extendedProps?.participant_limit || 0}</p>
                            )}
                            {/* Add more details as needed */}
                        </div>
                        <div className={styles.eventPopperActions}>
                            {event.extendedProps?.show_link && (event.extendedProps?.participant_limit || 0) > 0 && (
                                <a href={event.extendedProps?.show_link} target="_blank" rel="noopener noreferrer">
                                    Register Participants
                                </a>
                            )}
                            {(event.extendedProps?.edit_link) && userCanEdit() && (
                                <a href={event.extendedProps?.edit_link} target="_blank" rel="noopener noreferrer">
                                    Edit Event
                                </a>
                            )}
                            {/* Add more action buttons as needed */}
                        </div>
                    </div>
                </Popper>
            </ClickAwayListener>
        // </div>
    );
};

export default EventPopper;
