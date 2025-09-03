import './Home.css';
import { FaBuilding, FaIndustry, FaSchool, FaBoxOpen, FaPrint, FaDigitalOcean, FaBroom, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Rudra Stationery
        </motion.h1>
        <motion.p
          className="tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Your One-Stop Shop for All Office & Housekeeping Needs
        </motion.p>
        <motion.button
          className="cta-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/office-stationery")}
        >
          Explore Products
        </motion.button>
      </section>

      {/* About */}
      <section className="about">
        <h2>About Us</h2>
        <p>
          At Rudra Stationery, we take pride in being your trusted supplier of high-quality 
          stationery, housekeeping materials, and packaging solutions. With years of experience, 
          we serve diverse clients across Ahmedabad and surrounding areas.
        </p>
      </section>

      {/* Services */}
      <section className="services">
        <h2>We Serve</h2>
        <div className="service-grid">
          {[
            { icon: <FaBuilding />, title: "Corporate Offices", desc: "Complete office supply solutions for businesses of all sizes" },
            { icon: <FaIndustry />, title: "Industrial Units", desc: "Bulk supplies and packaging materials for industrial needs" },
            { icon: <FaSchool />, title: "Educational Institutions", desc: "Quality stationery and supplies for schools and colleges" },
            { icon: <FaBoxOpen />, title: "Retail Customers", desc: "Wide range of stationery and art supplies for individuals" }
          ].map((service, i) => (
            <motion.div
              key={i}
              className="service-card"
              whileHover={{ y: -8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Corporate Solutions */}
      <section className="solutions">
        <h2>Corporate Solutions</h2>
        <p className="solutions-intro">
          We provide end-to-end solutions for corporate offices, ensuring smooth operations 
          with our wide range of products and services.
        </p>
        <div className="solutions-grid">
          {[
            { icon: <FaPrint />, title: "Printing Solutions", desc: "All types of office printing needs – letterheads, visiting cards, envelopes, and more." },
            { icon: <FaDigitalOcean />, title: "Digital Printing", desc: "High-quality digital printing for presentations, reports, and corporate materials." },
            { icon: <FaBroom />, title: "Housekeeping Supplies", desc: "Cleaning materials, hygiene products, and office maintenance essentials." },
            { icon: <FaClipboardList />, title: "Corporate Office Materials", desc: "Everything from files, folders, markers, and whiteboards to packaging supplies." }
          ].map((sol, i) => (
            <motion.div
              key={i}
              className="solution-card"
              whileHover={{ y: -8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="solution-icon">{sol.icon}</div>
              <h3>{sol.title}</h3>
              <p>{sol.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="feature-list">
          {[
            { title: "Quality Products", desc: "We source only the best quality products from trusted manufacturers" },
            { title: "Competitive Pricing", desc: "Get the best value for your money with our competitive prices" },
            { title: "Timely Delivery", desc: "Quick and reliable delivery service to meet your deadlines" }
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
            {/* Categories */}
      <section className="categories">
        <h2>Premium Stationery</h2>
        <div className="category-grid">
          {[
            { name: "Pens", image: "/src/assets/Home/pens.jpg" },
            { name: "Pencils", image: "/src/assets/Home/pencil.jpg" },
            { name: "Notebooks", image: "/src/assets/Home/notebook.jpg" },
            { name: "Notepads", image: "/src/assets/Home/notepads.jpg" },
            { name: "Planners", image: "/src/assets/Home/planners.jpg" },
            { name: "Highlighters", image: "/src/assets/Home/hightlighters.jpg" },
            { name: "Files & Folders", image: "/src/assets/Home/files and folders.jpg" },
            { name: "To-do Lists", image: "/src/assets/Home/TODO list.jpg" },
            { name: "Sticky Notes", image: "/src/assets/Home/sticky notes.jpg" },
            { name: "Memo Blocks", image: "/src/assets/Home/memo blocks.jpg" },
      

          ].map((cat, i) => (
            <div className="category-card" key={i}>
              <div className="category-image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
