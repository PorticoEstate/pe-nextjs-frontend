import React, {FC} from 'react';
import styles from './event-popper.module.scss';
import ClickAwayListener from "@mui/material/ClickAwayListener";
import {Popper} from "@mui/material";
import {Placement} from "@popperjs/core";
import {formatEventTime, LuxDate} from "@/service/util";
import {FCallEvent} from "@/components/building-calendar/building-calendar.types";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup, faUser} from "@fortawesome/free-solid-svg-icons";
import {FilteredEventInfo} from "@/service/api/event-info";
import ColourCircle from "@/components/building-calendar/modules/colour-circle/colour-circle";

interface EventPopperProps {
    event: FCallEvent | null;
    anchor: HTMLElement | null;
    placement: Placement
    onClose: () => void;
    popperInfo?: FilteredEventInfo
}

const EventPopper: FC<EventPopperProps> = ({event, anchor, onClose, placement, popperInfo}) => {

    if (!event || !anchor) {
        return null;
    }

    const userCanEdit = () => {
        return popperInfo?.info_user_can_delete_bookings || popperInfo?.info_user_can_delete_events || popperInfo?.user_can_delete_allocations;
    };
    console.log(popperInfo, event)
    return (
        <ClickAwayListener onClickAway={onClose}>
            <Popper open={Boolean(event)} anchorEl={anchor}
                    placement={placement}
                    style={{zIndex: 100}}>
                <div className={styles.eventPopper}>
                    <div className={styles.eventPopperContent}>
                        <span className={`${styles.time} text-overline`}>
                            <FontAwesomeIcon className={'text-label'}
                                             icon={faClock}/>
                            {formatEventTime(event)}
                        </span>
                        <h3 className={styles.eventName}>{event.title}</h3>
                        <p className={`text-small ${styles.orderNumber}`}># {event.id}</p>
                        {popperInfo?.organizer && <p className={`text-small ${styles.organizer}`}>
                            <FontAwesomeIcon className={'text-small'}
                                             icon={faUser}/> {popperInfo?.organizer}
                        </p>}
                        <p className={`text-small ${styles.rentalResources}`}>
                            <FontAwesomeIcon className={'text-small'}
                                             icon={faLayerGroup}/> Rental resources
                        </p>
                        <div className={styles.resourcesList}>
                            {event.extendedProps?.source.resources?.map((resource, index: number) => (
                                <div key={index} className={styles.resourceItem}>
                                    <ColourCircle resourceId={resource.id} size={'medium'} />
                                    <span className={styles.resourceName}>{resource.name}</span>
                                </div>
                            ))}
                        </div>
                        {(popperInfo?.info_participant_limit || 0) > 0 && (
                            <p className={styles.participantLimit}>
                                <span className={styles.iconParticipants} /> Maximum number of participants
                            </p>
                        )}
                    </div>
                    <div className={styles.eventPopperActions}>
                        {event.extendedProps?.show_link && (popperInfo?.info_participant_limit || 0) > 0 && (
                            <a href={event.extendedProps?.show_link} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                                Register Participants
                            </a>
                        )}
                        {popperInfo?.info_edit_link && userCanEdit() && (
                            <a href={popperInfo?.info_edit_link} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                                Edit Event
                            </a>
                        )}
                    </div>
                    <div className={styles.eventPopperFooter}>
                        <button onClick={onClose} className={styles.closeButton}>Ok</button>
                    </div>
                </div>
            </Popper>
        </ClickAwayListener>
    );
};

export default EventPopper;
