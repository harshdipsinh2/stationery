import { Link } from 'react-router-dom';
import './MegaMenu.css';

const MegaMenu = ({ columns, onMouseEnter }) => {
  return (
    <div className="mega-menu" onMouseEnter={onMouseEnter}>
      <div className="mega-menu-content">
        {columns.map((column, index) => (
          <div className="mega-menu-column" key={index}>
            <h3 className="mega-menu-title">{column.title}</h3>
            <ul className="mega-menu-list">
              {column.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;
