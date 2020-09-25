export const People = ({ label, people }: { label: string, people: string[] }) => {
  if (people.length == 0) return <></>;

  const list = people.map((person) => <li key={person}>{person}</li>);
  return (
    <>
      <h3>{label}</h3>
      <ul>{list}</ul>
    </>
  )
}
