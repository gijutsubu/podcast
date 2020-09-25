export const Audience = ({ audiences }: { audiences: string[] }) => {
  // const audiences2 = ['hoge', 'huga', 'piyo'];
  const list = audiences.map((audience) => <li>{audience}</li>);
  return (
    <>
      <h3>聴講者</h3>
      <ul>{list}</ul>
    </>
  )
}
