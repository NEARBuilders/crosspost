export function GithubForkRibbon() {
  const repoLink = "https://github.com/nearbuilders/crosspost";
  return (
    <a
      className="github-fork-ribbon"
      href={repoLink}
      data-ribbon="Fork me on GitHub"
      title="Fork me on GitHub"
    ></a>
  );
}
