import React, {FC} from 'react';
import styles from './calender-resource-filter.module.scss';

export interface CalendarResourceFilterOption {
    value: string;
    label: string;
    color?: string;
}

interface CalendarResourceFilterProps {
    resourceOptions: CalendarResourceFilterOption[];
    enabledResources: Set<string>;
    onToggle: (resourceId: string) => void;
    onToggleAll: () => void;
}

const CalendarResourceFilter: FC<CalendarResourceFilterProps> = ({
                                                                     resourceOptions,
                                                                     enabledResources,
                                                                     onToggle,
                                                                     onToggleAll
                                                                 }) => {
    return (
        <div className={styles.resourceToggleContainer}>
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
                        <span
                            className={styles.resourceColorIndicator}
                            style={{backgroundColor: resource.color}}
                        />
                    </label>
                </div>
            ))}
        </div>
    );
};

export default CalendarResourceFilter;
