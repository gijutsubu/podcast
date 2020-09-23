import { parseISO, format } from 'date-fns'

export const Date = ({ raw }: { raw: string }) => {
  const date = parseISO(raw)
  return <time dateTime={raw}>{format(date, 'yyyy-mm-dd')}</time>
}
