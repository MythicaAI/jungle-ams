import {format, intlFormatDistance, parseISO} from "date-fns";

export const formatISO = (isoString: string): string => {
    const date = parseISO(isoString);
    return format(date, 'PPpp');
}

export const formatRelative = (isoString: string): string => {
    const date = parseISO(isoString);
    return intlFormatDistance(date, new Date(), {style: 'narrow'});
}