import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="page-section">
      <h2>Welcome</h2>
      <p>Track foods and manage your calorie data while learning React.</p>
      <p>
        Start on the <Link to="/foods">foods page</Link>.
      </p>
    </section>
  );
}
