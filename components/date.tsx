import { format } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'


type week = "日" | "月" | "火" | "水" | "木" | "金" | "土"

const weeks: Array<week> = ["日", "月", "火", "水", "木", "金", "土"]

export const Date = ({ raw }: { raw: string }) => {
  const date = zonedTimeToUtc(raw, 'Asia/Tokyo')
  return <time dateTime={raw}>{format(date, 'yyyy年MM月dd日(') + weeks[date.getDay()] + ')'}</time>
}
