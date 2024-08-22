import {createContext, FC, PropsWithChildren, useContext} from 'react';


interface CalendarContextType {
    resourceToIds: Record<number, number>;
}


const CalendarContext = createContext<CalendarContextType | undefined>(undefined);


export const useResourceToId = () => {
    const ctx = useCalendarContext();
    return ctx.resourceToIds;
}
export const useCalendarContext = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendarContext must be used within a CalendarProvider');
    }
    return context;
};

interface CalendarContextProps {
    resourceToIds: { [p: number]: number };

}

const CalendarProvider: FC<PropsWithChildren<CalendarContextProps>> = (props) => {
    return (
        <CalendarContext.Provider value={{resourceToIds: props.resourceToIds}}>
            {props.children}
        </CalendarContext.Provider>
    );
}

export default CalendarProvider


