import dateFns from "date-fns"

export const getMongoWholeDayQuery = (dateString: string) => {
    const date = new Date(dateString)
    return {
        $gte: dateFns.startOfDay(date),
        $lte: dateFns.endOfDay(date),
    }
}
