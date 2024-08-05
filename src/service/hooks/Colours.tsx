import {colours} from '../../styles/resource-colours.module.scss'
import {useEffect, useState} from "react";
export const useColours = (): Array<string> | undefined => {
    const [c, setC] = useState<Array<string>>();
    useEffect(() => {
        setC(colours.split(', '));
    }, [colours])
    return c
}
