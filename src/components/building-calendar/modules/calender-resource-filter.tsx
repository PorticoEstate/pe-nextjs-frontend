import React, {FC} from 'react';
import styles from './calender-resource-filter.module.scss';
import ColourCircle from "@/components/building-calendar/modules/colour-circle/colour-circle";

export interface CalendarResourceFilterOption {
    value: string;
    label: string;
    color?: string;
}

interface CalendarResourceFilterProps {
    hidden: boolean;
    resourceOptions: CalendarResourceFilterOption[];
    enabledResources: Set<string>;
    onToggle: (resourceId: string) => void;
    onToggleAll: () => void;
}

const CalendarResourceFilter: FC<CalendarResourceFilterProps> = ({
                                                                     resourceOptions,
                                                                     enabledResources,
                                                                     onToggle,
                                                                     onToggleAll,
                                                                     hidden
                                                                 }) => {


    return (
        <div className={`${styles.resourceToggleContainer} ${hidden ? styles.hidden : ''}`}
        >
            <div className={styles.toggleAllContainer}>
                <button
                    onClick={onToggleAll}
                    className={styles.toggleAllButton}
                >
                    {enabledResources.size === resourceOptions.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            {resourceOptions.map(resource => (
                <div key={resource.value} className={styles.resourceItem}>
                    <input
                        type="checkbox"
                        id={`resource-${resource.value}`}
                        checked={enabledResources.has(resource.value)}
                        onChange={() => onToggle(resource.value)}
                        className={styles.resourceCheckbox}
                    />
                    <label
                        htmlFor={`resource-${resource.value}`}
                        className={styles.resourceLabel}
                    >
                        {resource.label}
                       <ColourCircle resourceId={+resource.value} />
                    </label>
                </div>
            ))}
        </div>
    );
};

export default CalendarResourceFilter;
