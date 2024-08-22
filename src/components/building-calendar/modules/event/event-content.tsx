import React, {FC} from 'react';
import styles from './event-content.module.scss';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import {formatEventTime, LuxDate} from "@/service/util";
import {FCallEvent, FCEventContentArg} from "@/components/building-calendar/building-calendar.types";
import ColourCircle from "@/components/building-calendar/modules/colour-circle/colour-circle";


interface EventContentProps {
    eventInfo: FCEventContentArg<FCallEvent>;
    infoData: any;

}

const EventContent: FC<EventContentProps> = (props) => {
    const {eventInfo} = props;

    if (!['booking', 'allocation', 'event'].includes(eventInfo.event.extendedProps.type)) {
        return null;
    }

    const duration = eventInfo.event.end!.getTime() - eventInfo.event.start!.getTime();
    const durationInMinutes = duration / (1000 * 60);
    // Format the actual time text
    const actualTimeText = formatEventTime(eventInfo.event)

    const renderColorCircles = (maxCircles: number, size: 'medium' | 'small') => {
        const circlesToShow = eventInfo.event.extendedProps.source.resources.slice(0, maxCircles);
        const remainingCount = eventInfo.event.extendedProps.source.resources.length - maxCircles;

        return (
            <div className={styles.colorCircles}>
                {circlesToShow.map((res, index) => (
                    <ColourCircle resourceId={res.id} key={index} className={styles.colorCircle} size={size} />
                    // <span
                    //     key={index}
                    //     className={styles.colorCircle}
                    //     style={{backgroundColor: color}}
                    //     title={eventInfo.event.extendedProps.source.resources.map(a => a.name)[index]}
                    // />
                ))}
                {remainingCount > 0 && <span className={styles.remainingCount}>+{remainingCount}</span>}
            </div>
        );
    };

    if (durationInMinutes <= 45) {
        // Short event: single line with time and up to 3 color circles
        return (
            <div className={`${styles.event} ${styles.shortEvent}`}>
                <span className={`${styles.time} text-overline`}><FontAwesomeIcon className={'text-label'}
                                                                                  icon={faClock}/>{actualTimeText}</span>

                {renderColorCircles(3, 'small')}
            </div>
        );
    } else if (durationInMinutes <= 60) {
        // Medium event: two lines, time on first line, up to 6 color circles on second
        return (
            <div className={`${styles.event} ${styles.mediumEvent}`}>
                <span className={`${styles.time} text-overline`}><FontAwesomeIcon className={'text-label'}
                                                                                  icon={faClock}/>{actualTimeText}</span>
                <div className={`${styles.resourceIcons} text-label`}><FontAwesomeIcon
                    icon={faLayerGroup}/>{renderColorCircles(6, 'medium')}</div>
            </div>
        );
    } else {
        // Long event: three lines, time, title, and color circles
        return (
            <div className={`${styles.event} ${styles.longEvent}`}>
                <span className={`${styles.time} text-overline`}><FontAwesomeIcon className={'text-label'}
                                                                                  icon={faClock}/>{actualTimeText}</span>
                <div className={styles.title}>{eventInfo.event.title}</div>
                <div className={`${styles.resourceIcons} text-overline`}><FontAwesomeIcon className={'text-label'}
                                                                                          icon={faLayerGroup}/>{renderColorCircles(6, 'medium')}
                </div>

            </div>
        );
    }
};

export default EventContent;
