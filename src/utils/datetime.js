import { parse } from "date-fns"
import moment from "moment-timezone";

const timezone = 'Indian/Antananarivo'
class Datetime {
    static parse(value) {
        const formatString = 'yyyy-MM-dd HH:mm:ss'
        if (value == "0000-00-00 00:00:00") {
            return parse("1970-01-01 00:00:00", formatString, new Date());
        }
        else {
            const date = parse(value, formatString, new Date(value));
            const offset = 3 * 60
            const localDate = new Date(date.getTime() + offset * 60000)
            return localDate.toISOString()
        }
    }

    static now() {
        const dateInTimezone = moment().tz(timezone);
        const isoStringLocal = dateInTimezone.format('YYYY-MM-DDTHH:mm:ss');
        return `${isoStringLocal}.000Z`
    }

    static getDate() {
        const dateInTimezone = moment().tz(timezone);
        const isoStringLocal = dateInTimezone.format('YYYY-MM-DD HH:mm:ss');
        return isoStringLocal
    }
}

export default Datetime