import { Link } from 'react-router-dom';
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/office-stationery">Stationery Products</Link></li>
        <li><Link to="/housekeeping-materials">Housekeeping Materials</Link></li>
        <li><Link to="/packaging-materials">Packaging Materials</Link></li>
        <li><Link to="/art-craft">Art & Craft</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
