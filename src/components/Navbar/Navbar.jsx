import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import './Navbar.css'; // Import simplified styles for menu visibility
import logo from '../../assets/logo.svg';
import MegaMenu from '../MegaMenu/MegaMenu';
import MobileMenu from '../MobileMenu/MobileMenu';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const menuItemsRef = useRef([]);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifySuccess } = useNotification();
  const { items = [] } = useCart();
  
  const cartItemCount = items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Define the navigation menu structure
  const navMenuItems = [
    { 
      title: 'HOME', 
      path: '/' 
    },
    { 
      title: 'OFFICE STATIONERY', 
      path: '/category/office-stationery',
      columns: [
        {
          title: 'Desk Organizers',
          links: [
            { name: 'Pen Stands', path: '/category/desk-organizers/pen-stands' },
            { name: 'Stamp Pads', path: '/category/desk-organizers/stamp-pads' },
            { name: 'Calculators', path: '/category/desk-organizers/calculators' },
            { name: 'Letter Box', path: '/category/desk-organizers/letter-box' },
            { name: 'Wall Clocks', path: '/category/desk-organizers/wall-clocks' },
          ]
        },
        {
          title: 'Files & Folders',
          links: [
            { name: 'Box Files', path: '/category/files-folders/box-files' },
            { name: 'Plastic Files', path: '/category/files-folders/plastic-files' },
            { name: 'Document Folders', path: '/category/files-folders/document-folders' },
            { name: 'ID Holders', path: '/category/files-folders/id-holders' },
            { name: 'Envelopes', path: '/category/files-folders/envelopes' },
          ]
        },
        {
          title: 'Notebook & Diaries',
          links: [
            { name: 'Notebooks', path: '/category/notebook-diaries/notebooks' },
            { name: 'Pads', path: '/category/notebook-diaries/pads' },
            { name: 'Registers', path: '/category/notebook-diaries/registers' },
            { name: 'Executive Diaries', path: '/category/notebook-diaries/executive-diaries' },
          ]
        },
        {
          title: 'Copier Papers',
          links: [
            { name: 'JK Copier', path: '/category/copier-papers/jk-copier' },
            { name: 'Plotter Rolls', path: '/category/copier-papers/plotter-rolls' },
            { name: 'Continuous Paper', path: '/category/copier-papers/continuous-paper' },
            { name: 'Chart Paper', path: '/category/copier-papers/chart-paper' },
          ]
        },
        {
          title: 'Writing Supplies',
          links: [
            { name: 'Pens', path: '/category/writing-supplies/pens' },
            { name: 'Markers', path: '/category/writing-supplies/markers' },
            { name: 'Premium Pens', path: '/category/writing-supplies/premium-pens' },
            { name: 'Highlighters', path: '/category/writing-supplies/highlighters' },
            { name: 'Correction Pens', path: '/category/writing-supplies/correction-pens' },
          ]
        },
        {
          title: 'Office Basics',
          links: [
            { name: 'Staplers', path: '/category/office-basics/staplers' },
            { name: 'Scissors', path: '/category/office-basics/scissors' },
            { name: 'Glue Sticks', path: '/category/office-basics/glue-sticks' },
            { name: 'Clips', path: '/category/office-basics/clips' },
            { name: 'Whiteboards', path: '/category/office-basics/whiteboards' },
            { name: 'Measuring Tools', path: '/category/office-basics/measuring-tools' },
          ]
        }
      ]
    },
    { 
      title: 'HOUSEKEEPING MATERIALS', 
      path: '/category/housekeeping-materials',
      columns: [
        {
          title: 'CLEANING SUPPLIES',
          links: [
            { name: 'FLOOR CLEANERS', path: '/category/housekeeping-materials/floor-cleaners' },
            { name: 'GLASS CLEANERS', path: '/category/housekeeping-materials/glass-cleaners' },
            { name: 'SURFACE CLEANERS', path: '/category/housekeeping-materials/surface-cleaners' },
            { name: 'TOILET CLEANERS', path: '/category/housekeeping-materials/toilet-cleaners' },
            { name: 'HANDWASH', path: '/category/housekeeping-materials/handwash' },
            { name: 'DISINFECTANTS', path: '/category/housekeeping-materials/disinfectants' }
          ]
        },
        {
          title: 'CLEANING TOOLS',
          links: [
            { name: 'BROOMS & BRUSHES', path: '/category/housekeeping-materials/brooms-brushes' },
            { name: 'MOPS & WIPERS', path: '/category/housekeeping-materials/mops-wipers' },
            { name: 'DUSTBINS', path: '/category/housekeeping-materials/dustbins' },
            { name: 'DUSTERS & SPONGES', path: '/category/housekeeping-materials/dusters-sponges' },
            { name: 'GARBAGE BAGS', path: '/category/housekeeping-materials/garbage-bags' }
          ]
        },
        {
          title: 'BATHROOM SUPPLIES',
          links: [
            { name: 'TOILET PAPER', path: '/category/housekeeping-materials/toilet-paper' },
            { name: 'PAPER NAPKINS', path: '/category/housekeeping-materials/paper-napkins' },
            { name: 'ROOM FRESHENERS', path: '/category/housekeeping-materials/room-fresheners' },
            { name: 'HAND DRYERS', path: '/category/housekeeping-materials/hand-dryers' }
          ]
        }
      ]
    },
    { 
      title: 'PANTRY SUPPLIES', 
      path: '/category/pantry-supplies',
      columns: [
        {
          title: 'BEVERAGES',
          links: [
            { name: 'TEA & COFFEE', path: '/category/pantry-supplies/tea-coffee' },
            { name: 'SOFT DRINKS', path: '/category/pantry-supplies/soft-drinks' },
            { name: 'JUICES', path: '/category/pantry-supplies/juices' },
            { name: 'WATER', path: '/category/pantry-supplies/water' }
          ]
        },
        {
          title: 'SNACKS',
          links: [
            { name: 'BISCUITS & COOKIES', path: '/category/pantry-supplies/biscuits-cookies' },
            { name: 'NAMKEEN & CHIPS', path: '/category/pantry-supplies/namkeen-chips' },
            { name: 'CHOCOLATES & CANDIES', path: '/category/pantry-supplies/chocolates-candies' },
            { name: 'HEALTHY SNACKS', path: '/category/pantry-supplies/healthy-snacks' }
          ]
        },
        {
          title: 'PANTRY ESSENTIALS',
          links: [
            { name: 'SUGAR & SWEETENERS', path: '/category/pantry-supplies/sugar-sweeteners' },
            { name: 'MILK & CREAMERS', path: '/category/pantry-supplies/milk-creamers' },
            { name: 'DISPOSABLE CUPS & PLATES', path: '/category/pantry-supplies/disposable-items' },
            { name: 'KITCHEN SUPPLIES', path: '/category/pantry-supplies/kitchen-supplies' }
          ]
        }
      ]
    },
    { 
      title: 'IT AND ELECTRICAL', 
      path: '/category/it-electrical',
      columns: [
        {
          title: 'COMPUTER ACCESSORIES',
          links: [
            { name: 'KEYBOARDS & MICE', path: '/category/it-electrical/keyboards-mice' },
            { name: 'WEBCAMS', path: '/category/it-electrical/webcams' },
            { name: 'HEADPHONES', path: '/category/it-electrical/headphones' },
            { name: 'USB DRIVES', path: '/category/it-electrical/usb-drives' },
            { name: 'STORAGE DEVICES', path: '/category/it-electrical/storage-devices' }
          ]
        },
        {
          title: 'CABLES & ADAPTERS',
          links: [
            { name: 'USB CABLES', path: '/category/it-electrical/usb-cables' },
            { name: 'HDMI CABLES', path: '/category/it-electrical/hdmi-cables' },
            { name: 'POWER ADAPTERS', path: '/category/it-electrical/power-adapters' },
            { name: 'EXTENSION CORDS', path: '/category/it-electrical/extension-cords' }
          ]
        },
        {
          title: 'NETWORKING',
          links: [
            { name: 'ETHERNET CABLES', path: '/category/it-electrical/ethernet-cables' },
            { name: 'WIFI ADAPTERS', path: '/category/it-electrical/wifi-adapters' },
            { name: 'ROUTERS', path: '/category/it-electrical/routers' }
          ]
        },
        {
          title: 'ELECTRICAL SUPPLIES',
          links: [
            { name: 'BATTERIES', path: '/category/it-electrical/batteries' },
            { name: 'BULBS & LIGHTING', path: '/category/it-electrical/bulbs-lighting' },
            { name: 'ELECTRICAL TOOLS', path: '/category/it-electrical/electrical-tools' }
          ]
        }
      ]
    },
    { 
      title: 'PACKAGING MATERIALS', 
      path: '/category/packaging-materials',
      columns: [
        {
          title: 'CELLO AND BROWN BOPP TAPE',
          links: [
            { name: 'PACKAGING TAPE', path: '/category/packaging-materials/packaging-tape' },
            { name: 'MOUNTING TAPE TWO WAY TAPE', path: '/category/packaging-materials/mounting-tape' },
            { name: 'MASKING TAPE', path: '/category/packaging-materials/masking-tape' },
            { name: 'TAPE DISPENSERS', path: '/category/packaging-materials/tape-dispensers' },
          ]
        },
        {
          title: 'PACKAGING PROTECTIVE',
          links: [
            { name: 'BUBBLE ROLLS STRETCH FILM ROLLS', path: '/category/packaging-materials/bubble-rolls' },
            { name: 'AND CORRUGATED ROLL', path: '/category/packaging-materials/corrugated-roll' },
            { name: 'FOAM ROLLS AND THERMOCOL', path: '/category/packaging-materials/foam-rolls' },
            { name: 'ZIP LOCKS COVERS AND PLASTIC BAGS', path: '/category/packaging-materials/zip-locks' },
            { name: 'CABLE TIE', path: '/category/packaging-materials/cable-tie' },
            { name: 'RUBBER BANDS', path: '/category/packaging-materials/rubber-bands' },
          ]
        },
        {
          title: 'BOX PACKAGING MATERIALS',
          links: [
            { name: 'STAPPING PATI CLIP AND MACHINE', path: '/category/packaging-materials/stapping-pati' },
            { name: 'NAYLON ROPE AND EMPTY CARTON', path: '/category/packaging-materials/naylon-rope' },
            { name: 'BOX', path: '/category/packaging-materials/box' },
            { name: 'WEIGHING SCALE', path: '/category/packaging-materials/weighing-scale' },
          ]
        }
      ]
    },
    { 
      title: 'SAFETY SUPPLIES', 
      path: '/category/safety-supplies',
      columns: [
        {
          title: 'COVID 19',
          links: [
            { name: 'FACE PROTECTION', path: '/category/safety-supplies/face-protection' },
            { name: 'BODY PROTECTION', path: '/category/safety-supplies/body-protection' },
            { name: 'DISINFECTANTS', path: '/category/safety-supplies/disinfectants' },
            { name: 'INFRARED THERMOMETERS', path: '/category/safety-supplies/thermometers' },
          ]
        },
        {
          title: 'PPES',
          links: [
            { name: 'SAFETY HELMETS', path: '/category/safety-supplies/safety-helmets' },
            { name: 'SAFETY GOGGLES', path: '/category/safety-supplies/safety-goggles' },
            { name: 'REFLECTIVE JACKETS', path: '/category/safety-supplies/reflective-jackets' },
            { name: 'FIRST AID KIT', path: '/category/safety-supplies/first-aid-kit' },
          ]
        },
        {
          title: 'ROAD SAFETY',
          links: [
            { name: 'ANTI SKID TAPE', path: '/category/safety-supplies/anti-skid-tape' },
            { name: 'REFLECTIVE TAPE', path: '/category/safety-supplies/reflective-tape' },
            { name: 'OTHER SAFETY PRODUCTS', path: '/category/safety-supplies/other-safety-products' },
          ]
        },
        {
          title: 'FLOOR SAFETY',
          links: [
            { name: 'FLOOR TAPES', path: '/category/safety-supplies/floor-tapes' },
          ]
        }
      ]
    },
    { 
      title: 'CORPORATE GIFTS', 
      path: '/category/corporate-gifts',
      columns: [
        {
          title: 'EMPLOYEE GIFTS',
          links: [
            { name: 'SMARTWATCHES AND EAR PODS', path: '/category/corporate-gifts/smartwatches-ear-pods' },
            { name: 'PROMOTIONAL GIFT SET', path: '/category/corporate-gifts/promotional-gift-set' },
            { name: 'CUSTOMIZED NAME AND COMPANY LOGO', path: '/category/corporate-gifts/customized-name-logo' },
          ]
        }
      ]
    },
    { 
      title: 'ART AND CRAFT', 
      path: '/category/art-craft',
      columns: [
        {
          title: 'ART SUPPLIES',
          links: [
            { name: 'DRAWING PENCILS', path: '/category/art-craft/drawing-pencils' },
            { name: 'SKETCH PENS', path: '/category/art-craft/sketch-pens' },
            { name: 'CRAYONS', path: '/category/art-craft/crayons' },
            { name: 'PAINTS & BRUSHES', path: '/category/art-craft/paints-brushes' },
            { name: 'COLORING BOOKS', path: '/category/art-craft/coloring-books' }
          ]
        },
        {
          title: 'CRAFT MATERIALS',
          links: [
            { name: 'CRAFT PAPER', path: '/category/art-craft/craft-paper' },
            { name: 'SCISSORS & CUTTERS', path: '/category/art-craft/scissors-cutters' },
            { name: 'ADHESIVES', path: '/category/art-craft/adhesives' },
            { name: 'DECORATIVE ITEMS', path: '/category/art-craft/decorative-items' }
          ]
        },
        {
          title: 'SCHOOL ART SUPPLIES',
          links: [
            { name: 'GEOMETRY BOXES', path: '/category/art-craft/geometry-boxes' },
            { name: 'CLAY & MODELING', path: '/category/art-craft/clay-modeling' },
            { name: 'DRAWING BOARDS', path: '/category/art-craft/drawing-boards' }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating to a new page
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Effect to check and adjust menu positions when dropdown becomes active
  useEffect(() => {
    if (activeDropdown !== null && menuItemsRef.current[activeDropdown]) {
      const menuItem = menuItemsRef.current[activeDropdown];
      const megaMenu = menuItem.querySelector('.mega-menu');
      
      if (megaMenu) {
        // Reset position first to get accurate bounds
        megaMenu.style.left = '';
        megaMenu.style.right = '';
        
        const menuRect = megaMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // If menu extends beyond left edge
        if (menuRect.left < 0) {
          megaMenu.style.left = '0';
          megaMenu.style.right = 'auto';
        }
        
        // If menu extends beyond right edge
        if (menuRect.right > viewportWidth) {
          megaMenu.style.left = 'auto';
          megaMenu.style.right = '0';
        }
      }
    }
  }, [activeDropdown]);

  // Variable to store the timeout ID
  const timeoutRef = useRef(null);
  
  const handleMouseEnter = (index) => {
    // Clear any existing timeout to prevent dropdown flicker
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set active dropdown if this menu item has a dropdown
    const item = navMenuItems[index];
    if (item && item.columns) {
      setActiveDropdown(index);
    }
  };

  const handleMouseLeave = () => {
    // Set a shorter delay before hiding the dropdown
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 50);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page with the search term
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };
  
  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    notifySuccess('Logged out successfully');
  };
  
  const toggleProfileMenu = (e) => {
    e.preventDefault();
    setProfileMenuOpen(!profileMenuOpen);
  };
  
  const handleProfileAction = (action) => {
    setProfileMenuOpen(false);
    if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'orders') {
      navigate('/profile/orders');
    }
  };

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <div className="logo-container">
            <Link to="/" className="logo">
              <img src={logo} alt="Therudranterprise Logo" />
              <span>Therudranterprise</span>
            </Link>
          </div>

          <div className="search-container" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button type="submit" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </button>
            </form>
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="user-menu-wrapper" ref={profileMenuRef}>
                <a href="#" 
                   className="nav-link profile-button" 
                   onClick={toggleProfileMenu}
                   aria-expanded={profileMenuOpen}
                   aria-haspopup="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  {user?.name || 'Profile'}
                  <svg className="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </a>
                <div className={`user-dropdown ${profileMenuOpen ? 'visible' : ''}`}>
                  <button onClick={() => handleProfileAction('profile')} className="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    My Profile
                  </button>
                  <button onClick={() => handleProfileAction('orders')} className="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                      <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                    </svg>
                    My Orders
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-link login-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
                Login
              </Link>
            )}
            <Link to="/category" className="nav-link shop-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
              </svg>
              Shop
            </Link>
            <Link to="/cart" className="cart-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              Cart
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </Link>

            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      <div className="category-menu">
        <div className="container">
          <nav className="desktop-menu">
            <ul className="main-menu">
              {navMenuItems.map((item, index) => (
                <li 
                  key={index} 
                  className={`menu-item ${activeDropdown === index ? 'active' : ''} ${item.columns ? 'has-dropdown' : ''}`}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  ref={el => menuItemsRef.current[index] = el}
                >
                  <Link to={item.path}>{item.title}</Link>
                  {item.columns && activeDropdown === index && (
                    <MegaMenu 
                      columns={item.columns} 
                      onMouseEnter={() => {
                        if (timeoutRef.current) {
                          clearTimeout(timeoutRef.current);
                        }
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <MobileMenu 
          menuItems={navMenuItems} 
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};

export default Navbar;
