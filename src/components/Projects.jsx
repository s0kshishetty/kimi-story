import PortalPuzzle from './PortalPuzzle'
import FlowerWalk from './FlowerWalk'
import JournalProject from '../journal/JournalProject'
import Stars from './Stars'
export default function Projects() {
  return (
    <section className="projects" id="projects" aria-label="Kimi's projects">
      <Stars count={60} />
      <div className="projects-head">
        <small>After the story</small>
        <h2>Kimi's Projects</h2>
        <p>Three little adventures from Meoptune. Go on, play.</p>
      </div>
      <article className="project">
        <div className="project-info">
          <span className="badge">Project 01</span>
          <h3>Portal Repair Workshop</h3>
          <p>The Great Whoosh is wobbly. Drag every star onto the matching colour of the portal ring to open it up again, and see what Kimi decides to do.</p>
        </div>
        <PortalPuzzle />
      </article>
      <article className="project">
        <div className="project-info">
          <span className="badge">Project 02</span>
          <h3>Starlight Garden Walk</h3>
          <p>It's night on Meoptune. Wherever Kimi walks, the flowers twirl and glow like starlight. Steer her with the arrow keys (or tap and drag) and collect fish for the Cat Queen.</p>
        </div>
        <FlowerWalk />
      </article>
      <article className="project">
        <div className="project-info">
          <span className="badge">Project 03</span>
          <h3>Kimi's Cat Journal</h3>
          <p>Her private little notebook. Open it to meet every cat Kimi has found on Meoptune, and read what she wrote about each one.</p>
        </div>
        <JournalProject />
      </article>
    </section>)
}
