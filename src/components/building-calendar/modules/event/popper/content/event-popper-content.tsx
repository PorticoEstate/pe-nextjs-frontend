import React, {FC} from 'react';
import {usePopperData, usePopperGlobalInfo} from "@/service/api/event-info";
import {FCallEvent} from "@/components/building-calendar/building-calendar.types";
import styles from "@/components/building-calendar/modules/event/popper/event-popper.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {formatEventTime} from "@/service/util";
import {faUser, faUsers} from "@fortawesome/free-solid-svg-icons";
import ColourCircle from "@/components/building-calendar/modules/colour-circle/colour-circle";
import {Button} from "@digdir/designsystemet-react";

interface EventPopperContentProps {
    event: FCallEvent
    onClose: () => void;
}

const EventPopperContent: FC<EventPopperContentProps> = (props) => {
    const {event, onClose} = props
    const {data: popperInfo, isLoading} = usePopperGlobalInfo(event.extendedProps.type, event.id);
    if(!popperInfo) {
        return;
    }

    const userCanEdit = () => {
        return popperInfo.info_user_can_delete_bookings || popperInfo.info_user_can_delete_events || popperInfo.info_user_can_delete_allocations;
    };
    return (
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
                <div className={styles.resourcesList}>
                    {event.extendedProps?.source.resources?.map((resource, index: number) => (
                        <div key={index} className={styles.resourceItem}>
                            <ColourCircle resourceId={resource.id} size={'medium'}/>
                            <span className={styles.resourceName}>{resource.name}</span>
                        </div>
                    ))}
                </div>
                {(popperInfo?.info_participant_limit || 0) > 0 && (
                    <p className={styles.participantLimit}>
                        <FontAwesomeIcon className={'text-small'}
                                         icon={faUsers}/> Max {popperInfo?.info_participant_limit} participants
                    </p>
                )}
            </div>
            <div className={styles.eventPopperActions}>
                {event.extendedProps?.show_link && (popperInfo?.info_participant_limit || 0) > 0 && (
                    <a href={event.extendedProps?.show_link} target="_blank" rel="noopener noreferrer"
                       className={styles.actionButton}>
                        Register Participants
                    </a>
                )}
                {popperInfo?.info_edit_link && userCanEdit() && (
                    <a href={popperInfo?.info_edit_link} target="_blank" rel="noopener noreferrer"
                       className={styles.actionButton}>
                        Edit Event
                    </a>
                )}
            </div>
            <div className={styles.eventPopperFooter}>
                <Button onClick={onClose} variant="tertiary" className={'default'} size={'sm'}>Ok</Button>
            </div>
        </div>
    );
}

export default EventPopperContent


