import React, {Dispatch, FC} from 'react';
import {Button} from "@digdir/designsystemet-react";

interface CalendarInnerHeaderProps {
    resourcesHidden: boolean
    setResourcesHidden: Dispatch<boolean>
    setView: Dispatch<string>;
    setLastCalendarView: Dispatch<void>;
    view: string;
}

const CalendarInnerHeader: FC<CalendarInnerHeaderProps> = (props) => {
    const {resourcesHidden, setResourcesHidden, view} = props
    return (
        <div style={{gridColumn: 2, display: 'flex', justifyContent: 'space-between'}}>
            <button onClick={() => setResourcesHidden(!resourcesHidden)}>ToggleMe</button>
            <div style={{display: 'flex', gap: '1 rem'}}>
                <Button variant={view !== 'listWeek' ? 'primary' : 'secondary'} onClick={() => {
                    props.setLastCalendarView()
                }}>Kalendervisning</Button>
                <Button variant={view === 'listWeek' ? 'primary' : 'secondary'} onClick={() => {
                    props.setView('listWeek')
                }}>Listevisning</Button>
            </div>
        </div>
    );
}

export default CalendarInnerHeader


