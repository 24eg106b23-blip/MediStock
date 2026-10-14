import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/medicines";

function Icon({ name }) {
  const icons = {
    dashboard: "▦",
    medicine: "⚕",
    sales: "▤",
    expiry: "◷",
    reports: "▥",
    settings: "⚙",
    search: "⌕",
    plus: "+",
    bell: "♧",
    menu: "☰",
    arrow: "→",
    close: "×",
  };

  return <span className={`icon icon-${name}`}>{icons[name] || "•"}</span>;
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    category: "",
    batch: "",
    stock: "",
    expiry: "",
    price: "",
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load medicines");
      }

      const data = await response.json();

      const formattedData = data.map((medicine) => ({
        ...medicine,
        batch: medicine.batchNumber,
        expiry: medicine.expiryDate,
        stock: medicine.stock,
        price: medicine.price,
      }));

      setMedicines(formattedData);
    } catch (error) {
      console.error(error);
      setNotification("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) =>
      `${medicine.name} ${medicine.category} ${medicine.batch}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [medicines, search]);

  const totalStock = medicines.reduce(
    (total, medicine) => total + Number(medicine.stock || 0),
    0
  );

  const lowStock = medicines.filter((medicine) => medicine.stock <= 20);

  const expiringSoon = medicines.filter((medicine) => {
    const today = new Date();
    const expiry = new Date(medicine.expiry);

    const difference = expiry - today;

    return (
      difference > 0 &&
      difference < 1000 * 60 * 60 * 24 * 90
    );
  });

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    if (
      !newMedicine.name ||
      !newMedicine.category ||
      !newMedicine.batch ||
      !newMedicine.stock ||
      !newMedicine.expiry ||
      !newMedicine.price
    ) {
      setNotification("Please fill all medicine details.");
      return;
    }

    const medicine = {
      name: newMedicine.name,
      category: newMedicine.category,
      batchNumber: newMedicine.batch,
      expiryDate: newMedicine.expiry,
      price: Number(newMedicine.price),
      stock: Number(newMedicine.stock),
      supplier: "MediStock",
      genericName: null,
      manufacturer: null,
      purchasePrice: 0,
      reorderLevel: 10,
      sellingPrice: Number(newMedicine.price),
      stockQuantity: Number(newMedicine.stock),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicine),
      });

      if (!response.ok) {
        throw new Error("Failed to add medicine");
      }

      setNewMedicine({
        name: "",
        category: "",
        batch: "",
        stock: "",
        expiry: "",
        price: "",
      });

      setShowAdd(false);

      setNotification("Medicine added successfully!");

      await loadMedicines();

      setTimeout(() => {
        setNotification("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setNotification("Failed to add medicine.");
    }
  };

  const navigation = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Medicines", icon: "medicine" },
    { name: "Sales", icon: "sales" },
    { name: "Expiry Alerts", icon: "expiry" },
    { name: "Reports", icon: "reports" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">M</div>

          <div>
            <h2>MediStock</h2>
            <p>Smart Inventory</p>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-title">MAIN MENU</p>

          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>

            <div>
              <strong>Need Help?</strong>
              <p>Contact support</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">JD</div>

            <div className="profile-info">
              <strong>J Deepak</strong>
              <span>Administrator</span>
            </div>

            <span className="profile-arrow">•••</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-menu">
            <Icon name="menu" />
          </div>

          <div className="page-heading">
            <h1>{activePage}</h1>

            <p>
              {activePage === "Dashboard"
                ? "Welcome back! Here's your pharmacy overview."
                : `Manage your ${activePage.toLowerCase()} efficiently.`}
            </p>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Icon name="search" />

              <input
                type="text"
                placeholder="Search medicines..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="notification">
              <Icon name="bell" />
              <span></span>
            </button>

            <div className="top-avatar">JD</div>
          </div>
        </header>

        <section className="content">
          {notification && (
            <div className="success-message">
              ✓ {notification}
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <div className="welcome-banner">
                <div>
                  <span className="banner-label">
                    MEDISTOCK MANAGEMENT
                  </span>

                  <h2>Manage your pharmacy smarter.</h2>

                  <p>
                    Keep track of medicines, inventory, sales and expiry dates
                    in one place.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setShowAdd(true)}
                  >
                    <Icon name="plus" />
                    Add Medicine
                  </button>
                </div>

                <div className="banner-shape">
                  <div className="medical-cross">+</div>
                  <div className="pill pill-one"></div>
                  <div className="pill pill-two"></div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Icon name="medicine" />
                  </div>

                  <div>
                    <p>Total Medicines</p>
                    <h3>{medicines.length}</h3>
                    <span className="positive">Live database</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">▣</div>

                  <div>
                    <p>Total Stock Units</p>
                    <h3>{totalStock}</h3>
                    <span className="positive">From MySQL</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">!</div>

                  <div>
                    <p>Low Stock Items</p>
                    <h3>{lowStock.length}</h3>
                    <span className="warning-text">
                      Needs attention
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon red">
                    <Icon name="expiry" />
                  </div>

                  <div>
                    <p>Expiring Soon</p>
                    <h3>{expiringSoon.length}</h3>
                    <span className="danger-text">
                      Within 90 days
                    </span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="panel inventory-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Recent Medicines</h3>
                      <p>Latest medicines in your inventory</p>
                    </div>

                    <button
                      className="view-button"
                      onClick={() => setActivePage("Medicines")}
                    >
                      View All <Icon name="arrow" />
                    </button>
                  </div>

                  <div className="table-container">
                    {loading ? (
                      <p style={{ padding: "20px" }}>
                        Loading medicines...
                      </p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {medicines.slice(0, 5).map((medicine) => (
                            <tr key={medicine.id}>
                              <td>
                                <div className="medicine-name">
                                  <div className="medicine-icon">
                                    ✚
                                  </div>

                                  <div>
                                    <strong>{medicine.name}</strong>
                                    <small>{medicine.batch}</small>
                                  </div>
                                </div>
                              </td>

                              <td>{medicine.category}</td>

                              <td>
                                <strong>{medicine.stock}</strong>
                              </td>

                              <td>{medicine.expiry}</td>

                              <td>
                                <span
                                  className={`status ${
                                    medicine.stock <= 20
                                      ? "low"
                                      : "available"
                                  }`}
                                >
                                  {medicine.stock <= 20
                                    ? "Low Stock"
                                    : "Available"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="panel alert-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Expiry Alerts</h3>
                      <p>Medicines requiring attention</p>
                    </div>

                    <div className="alert-count">
                      {expiringSoon.length}
                    </div>
                  </div>

                  {expiringSoon.length === 0 ? (
                    <div className="empty-alert">
                      <div>✓</div>
                      <p>No medicines expiring soon.</p>
                    </div>
                  ) : (
                    <div className="alert-list">
                      {expiringSoon.map((medicine) => (
                        <div
                          className="alert-item"
                          key={medicine.id}
                        >
                          <div className="alert-medicine-icon">
                            !
                          </div>

                          <div>
                            <strong>{medicine.name}</strong>
                            <p>Expires {medicine.expiry}</p>
                          </div>

                          <span>Check</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activePage === "Medicines" && (
            <div className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h3>Medicine Inventory</h3>
                  <p>Manage all medicines in your pharmacy</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowAdd(true)}
                >
                  <Icon name="plus" />
                  Add Medicine
                </button>
              </div>

              <div className="medicine-search">
                <Icon name="search" />

                <input
                  type="text"
                  placeholder="Search by medicine, category or batch..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Batch</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMedicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>
                          <div className="medicine-name">
                            <div className="medicine-icon">
                              ✚
                            </div>

                            <strong>{medicine.name}</strong>
                          </div>
                        </td>

                        <td>{medicine.category}</td>
                        <td>{medicine.batch}</td>
                        <td>{medicine.stock}</td>
                        <td>₹{medicine.price}</td>
                        <td>{medicine.expiry}</td>

                        <td>
                          <span
                            className={`status ${
                              medicine.stock <= 20
                                ? "low"
                                : "available"
                            }`}
                          >
                            {medicine.stock <= 20
                              ? "Low Stock"
                              : "Available"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage !== "Dashboard" &&
            activePage !== "Medicines" && (
              <div className="coming-soon">
                <div className="coming-icon">
                  <Icon
                    name={
                      navigation.find(
                        (item) => item.name === activePage
                      )?.icon
                    }
                  />
                </div>

                <h2>{activePage}</h2>

                <p>
                  This module is ready for integration with your
                  MediStock backend.
                </p>

                {activePage === "Sales" && (
                  <button
                    className="primary-button"
                    onClick={() => setActivePage("Medicines")}
                  >
                    Go to Inventory <Icon name="arrow" />
                  </button>
                )}
              </div>
            )}
        </section>
      </main>

      {showAdd && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add New Medicine</h2>
                <p>Enter medicine details below</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowAdd(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine Name</label>

                  <input
                    type="text"
                    placeholder="e.g. Paracetamol 500mg"
                    value={newMedicine.name}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        name: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    value={newMedicine.category}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        category: event.target.value,
                      })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="Pain Relief">
                      Pain Relief
                    </option>
                    <option value="Antibiotic">
                      Antibiotic
                    </option>
                    <option value="Allergy">Allergy</option>
                    <option value="Supplements">
                      Supplements
                    </option>
                    <option value="Tablet">Tablet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Batch Number</label>

                  <input
                    type="text"
                    placeholder="e.g. PCM2026F"
                    value={newMedicine.batch}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        batch: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicine.stock}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        stock: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>

                  <input
                    type="date"
                    value={newMedicine.expiry}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        expiry: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicine.price}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        price: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Icon name="plus" />
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/medicines";

function Icon({ name }) {
  const icons = {
    dashboard: "▦",
    medicine: "⚕",
    sales: "▤",
    expiry: "◷",
    reports: "▥",
    settings: "⚙",
    search: "⌕",
    plus: "+",
    bell: "♧",
    menu: "☰",
    arrow: "→",
    close: "×",
  };

  return <span className={`icon icon-${name}`}>{icons[name] || "•"}</span>;
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    category: "",
    batch: "",
    stock: "",
    expiry: "",
    price: "",
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load medicines");
      }

      const data = await response.json();

      const formattedData = data.map((medicine) => ({
        ...medicine,
        batch: medicine.batchNumber,
        expiry: medicine.expiryDate,
        stock: medicine.stock,
        price: medicine.price,
      }));

      setMedicines(formattedData);
    } catch (error) {
      console.error(error);
      setNotification("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) =>
      `${medicine.name} ${medicine.category} ${medicine.batch}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [medicines, search]);

  const totalStock = medicines.reduce(
    (total, medicine) => total + Number(medicine.stock || 0),
    0
  );

  const lowStock = medicines.filter((medicine) => medicine.stock <= 20);

  const expiringSoon = medicines.filter((medicine) => {
    const today = new Date();
    const expiry = new Date(medicine.expiry);

    const difference = expiry - today;

    return (
      difference > 0 &&
      difference < 1000 * 60 * 60 * 24 * 90
    );
  });

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    if (
      !newMedicine.name ||
      !newMedicine.category ||
      !newMedicine.batch ||
      !newMedicine.stock ||
      !newMedicine.expiry ||
      !newMedicine.price
    ) {
      setNotification("Please fill all medicine details.");
      return;
    }

    const medicine = {
      name: newMedicine.name,
      category: newMedicine.category,
      batchNumber: newMedicine.batch,
      expiryDate: newMedicine.expiry,
      price: Number(newMedicine.price),
      stock: Number(newMedicine.stock),
      supplier: "MediStock",
      genericName: null,
      manufacturer: null,
      purchasePrice: 0,
      reorderLevel: 10,
      sellingPrice: Number(newMedicine.price),
      stockQuantity: Number(newMedicine.stock),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicine),
      });

      if (!response.ok) {
        throw new Error("Failed to add medicine");
      }

      setNewMedicine({
        name: "",
        category: "",
        batch: "",
        stock: "",
        expiry: "",
        price: "",
      });

      setShowAdd(false);

      setNotification("Medicine added successfully!");

      await loadMedicines();

      setTimeout(() => {
        setNotification("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setNotification("Failed to add medicine.");
    }
  };

  const navigation = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Medicines", icon: "medicine" },
    { name: "Sales", icon: "sales" },
    { name: "Expiry Alerts", icon: "expiry" },
    { name: "Reports", icon: "reports" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">M</div>

          <div>
            <h2>MediStock</h2>
            <p>Smart Inventory</p>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-title">MAIN MENU</p>

          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>

            <div>
              <strong>Need Help?</strong>
              <p>Contact support</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">JD</div>

            <div className="profile-info">
              <strong>J Deepak</strong>
              <span>Administrator</span>
            </div>

            <span className="profile-arrow">•••</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-menu">
            <Icon name="menu" />
          </div>

          <div className="page-heading">
            <h1>{activePage}</h1>

            <p>
              {activePage === "Dashboard"
                ? "Welcome back! Here's your pharmacy overview."
                : `Manage your ${activePage.toLowerCase()} efficiently.`}
            </p>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Icon name="search" />

              <input
                type="text"
                placeholder="Search medicines..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="notification">
              <Icon name="bell" />
              <span></span>
            </button>

            <div className="top-avatar">JD</div>
          </div>
        </header>

        <section className="content">
          {notification && (
            <div className="success-message">
              ✓ {notification}
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <div className="welcome-banner">
                <div>
                  <span className="banner-label">
                    MEDISTOCK MANAGEMENT
                  </span>

                  <h2>Manage your pharmacy smarter.</h2>

                  <p>
                    Keep track of medicines, inventory, sales and expiry dates
                    in one place.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setShowAdd(true)}
                  >
                    <Icon name="plus" />
                    Add Medicine
                  </button>
                </div>

                <div className="banner-shape">
                  <div className="medical-cross">+</div>
                  <div className="pill pill-one"></div>
                  <div className="pill pill-two"></div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Icon name="medicine" />
                  </div>

                  <div>
                    <p>Total Medicines</p>
                    <h3>{medicines.length}</h3>
                    <span className="positive">Live database</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">▣</div>

                  <div>
                    <p>Total Stock Units</p>
                    <h3>{totalStock}</h3>
                    <span className="positive">From MySQL</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">!</div>

                  <div>
                    <p>Low Stock Items</p>
                    <h3>{lowStock.length}</h3>
                    <span className="warning-text">
                      Needs attention
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon red">
                    <Icon name="expiry" />
                  </div>

                  <div>
                    <p>Expiring Soon</p>
                    <h3>{expiringSoon.length}</h3>
                    <span className="danger-text">
                      Within 90 days
                    </span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="panel inventory-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Recent Medicines</h3>
                      <p>Latest medicines in your inventory</p>
                    </div>

                    <button
                      className="view-button"
                      onClick={() => setActivePage("Medicines")}
                    >
                      View All <Icon name="arrow" />
                    </button>
                  </div>

                  <div className="table-container">
                    {loading ? (
                      <p style={{ padding: "20px" }}>
                        Loading medicines...
                      </p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {medicines.slice(0, 5).map((medicine) => (
                            <tr key={medicine.id}>
                              <td>
                                <div className="medicine-name">
                                  <div className="medicine-icon">
                                    ✚
                                  </div>

                                  <div>
                                    <strong>{medicine.name}</strong>
                                    <small>{medicine.batch}</small>
                                  </div>
                                </div>
                              </td>

                              <td>{medicine.category}</td>

                              <td>
                                <strong>{medicine.stock}</strong>
                              </td>

                              <td>{medicine.expiry}</td>

                              <td>
                                <span
                                  className={`status ${
                                    medicine.stock <= 20
                                      ? "low"
                                      : "available"
                                  }`}
                                >
                                  {medicine.stock <= 20
                                    ? "Low Stock"
                                    : "Available"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="panel alert-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Expiry Alerts</h3>
                      <p>Medicines requiring attention</p>
                    </div>

                    <div className="alert-count">
                      {expiringSoon.length}
                    </div>
                  </div>

                  {expiringSoon.length === 0 ? (
                    <div className="empty-alert">
                      <div>✓</div>
                      <p>No medicines expiring soon.</p>
                    </div>
                  ) : (
                    <div className="alert-list">
                      {expiringSoon.map((medicine) => (
                        <div
                          className="alert-item"
                          key={medicine.id}
                        >
                          <div className="alert-medicine-icon">
                            !
                          </div>

                          <div>
                            <strong>{medicine.name}</strong>
                            <p>Expires {medicine.expiry}</p>
                          </div>

                          <span>Check</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activePage === "Medicines" && (
            <div className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h3>Medicine Inventory</h3>
                  <p>Manage all medicines in your pharmacy</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowAdd(true)}
                >
                  <Icon name="plus" />
                  Add Medicine
                </button>
              </div>

              <div className="medicine-search">
                <Icon name="search" />

                <input
                  type="text"
                  placeholder="Search by medicine, category or batch..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Batch</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMedicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>
                          <div className="medicine-name">
                            <div className="medicine-icon">
                              ✚
                            </div>

                            <strong>{medicine.name}</strong>
                          </div>
                        </td>

                        <td>{medicine.category}</td>
                        <td>{medicine.batch}</td>
                        <td>{medicine.stock}</td>
                        <td>₹{medicine.price}</td>
                        <td>{medicine.expiry}</td>

                        <td>
                          <span
                            className={`status ${
                              medicine.stock <= 20
                                ? "low"
                                : "available"
                            }`}
                          >
                            {medicine.stock <= 20
                              ? "Low Stock"
                              : "Available"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage !== "Dashboard" &&
            activePage !== "Medicines" && (
              <div className="coming-soon">
                <div className="coming-icon">
                  <Icon
                    name={
                      navigation.find(
                        (item) => item.name === activePage
                      )?.icon
                    }
                  />
                </div>

                <h2>{activePage}</h2>

                <p>
                  This module is ready for integration with your
                  MediStock backend.
                </p>

                {activePage === "Sales" && (
                  <button
                    className="primary-button"
                    onClick={() => setActivePage("Medicines")}
                  >
                    Go to Inventory <Icon name="arrow" />
                  </button>
                )}
              </div>
            )}
        </section>
      </main>

      {showAdd && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add New Medicine</h2>
                <p>Enter medicine details below</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowAdd(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine Name</label>

                  <input
                    type="text"
                    placeholder="e.g. Paracetamol 500mg"
                    value={newMedicine.name}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        name: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    value={newMedicine.category}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        category: event.target.value,
                      })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="Pain Relief">
                      Pain Relief
                    </option>
                    <option value="Antibiotic">
                      Antibiotic
                    </option>
                    <option value="Allergy">Allergy</option>
                    <option value="Supplements">
                      Supplements
                    </option>
                    <option value="Tablet">Tablet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Batch Number</label>

                  <input
                    type="text"
                    placeholder="e.g. PCM2026F"
                    value={newMedicine.batch}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        batch: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicine.stock}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        stock: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>

                  <input
                    type="date"
                    value={newMedicine.expiry}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        expiry: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicine.price}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        price: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Icon name="plus" />
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/medicines";

function Icon({ name }) {
  const icons = {
    dashboard: "▦",
    medicine: "⚕",
    sales: "▤",
    expiry: "◷",
    reports: "▥",
    settings: "⚙",
    search: "⌕",
    plus: "+",
    bell: "♧",
    menu: "☰",
    arrow: "→",
    close: "×",
  };

  return <span className={`icon icon-${name}`}>{icons[name] || "•"}</span>;
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    category: "",
    batch: "",
    stock: "",
    expiry: "",
    price: "",
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load medicines");
      }

      const data = await response.json();

      const formattedData = data.map((medicine) => ({
        ...medicine,
        batch: medicine.batchNumber,
        expiry: medicine.expiryDate,
        stock: medicine.stock,
        price: medicine.price,
      }));

      setMedicines(formattedData);
    } catch (error) {
      console.error(error);
      setNotification("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) =>
      `${medicine.name} ${medicine.category} ${medicine.batch}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [medicines, search]);

  const totalStock = medicines.reduce(
    (total, medicine) => total + Number(medicine.stock || 0),
    0
  );

  const lowStock = medicines.filter((medicine) => medicine.stock <= 20);

  const expiringSoon = medicines.filter((medicine) => {
    const today = new Date();
    const expiry = new Date(medicine.expiry);

    const difference = expiry - today;

    return (
      difference > 0 &&
      difference < 1000 * 60 * 60 * 24 * 90
    );
  });

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    if (
      !newMedicine.name ||
      !newMedicine.category ||
      !newMedicine.batch ||
      !newMedicine.stock ||
      !newMedicine.expiry ||
      !newMedicine.price
    ) {
      setNotification("Please fill all medicine details.");
      return;
    }

    const medicine = {
      name: newMedicine.name,
      category: newMedicine.category,
      batchNumber: newMedicine.batch,
      expiryDate: newMedicine.expiry,
      price: Number(newMedicine.price),
      stock: Number(newMedicine.stock),
      supplier: "MediStock",
      genericName: null,
      manufacturer: null,
      purchasePrice: 0,
      reorderLevel: 10,
      sellingPrice: Number(newMedicine.price),
      stockQuantity: Number(newMedicine.stock),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicine),
      });

      if (!response.ok) {
        throw new Error("Failed to add medicine");
      }

      setNewMedicine({
        name: "",
        category: "",
        batch: "",
        stock: "",
        expiry: "",
        price: "",
      });

      setShowAdd(false);

      setNotification("Medicine added successfully!");

      await loadMedicines();

      setTimeout(() => {
        setNotification("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setNotification("Failed to add medicine.");
    }
  };

  const navigation = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Medicines", icon: "medicine" },
    { name: "Sales", icon: "sales" },
    { name: "Expiry Alerts", icon: "expiry" },
    { name: "Reports", icon: "reports" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">M</div>

          <div>
            <h2>MediStock</h2>
            <p>Smart Inventory</p>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-title">MAIN MENU</p>

          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>

            <div>
              <strong>Need Help?</strong>
              <p>Contact support</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">JD</div>

            <div className="profile-info">
              <strong>J Deepak</strong>
              <span>Administrator</span>
            </div>

            <span className="profile-arrow">•••</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-menu">
            <Icon name="menu" />
          </div>

          <div className="page-heading">
            <h1>{activePage}</h1>

            <p>
              {activePage === "Dashboard"
                ? "Welcome back! Here's your pharmacy overview."
                : `Manage your ${activePage.toLowerCase()} efficiently.`}
            </p>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Icon name="search" />

              <input
                type="text"
                placeholder="Search medicines..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="notification">
              <Icon name="bell" />
              <span></span>
            </button>

            <div className="top-avatar">JD</div>
          </div>
        </header>

        <section className="content">
          {notification && (
            <div className="success-message">
              ✓ {notification}
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <div className="welcome-banner">
                <div>
                  <span className="banner-label">
                    MEDISTOCK MANAGEMENT
                  </span>

                  <h2>Manage your pharmacy smarter.</h2>

                  <p>
                    Keep track of medicines, inventory, sales and expiry dates
                    in one place.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setShowAdd(true)}
                  >
                    <Icon name="plus" />
                    Add Medicine
                  </button>
                </div>

                <div className="banner-shape">
                  <div className="medical-cross">+</div>
                  <div className="pill pill-one"></div>
                  <div className="pill pill-two"></div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Icon name="medicine" />
                  </div>

                  <div>
                    <p>Total Medicines</p>
                    <h3>{medicines.length}</h3>
                    <span className="positive">Live database</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">▣</div>

                  <div>
                    <p>Total Stock Units</p>
                    <h3>{totalStock}</h3>
                    <span className="positive">From MySQL</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">!</div>

                  <div>
                    <p>Low Stock Items</p>
                    <h3>{lowStock.length}</h3>
                    <span className="warning-text">
                      Needs attention
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon red">
                    <Icon name="expiry" />
                  </div>

                  <div>
                    <p>Expiring Soon</p>
                    <h3>{expiringSoon.length}</h3>
                    <span className="danger-text">
                      Within 90 days
                    </span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="panel inventory-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Recent Medicines</h3>
                      <p>Latest medicines in your inventory</p>
                    </div>

                    <button
                      className="view-button"
                      onClick={() => setActivePage("Medicines")}
                    >
                      View All <Icon name="arrow" />
                    </button>
                  </div>

                  <div className="table-container">
                    {loading ? (
                      <p style={{ padding: "20px" }}>
                        Loading medicines...
                      </p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {medicines.slice(0, 5).map((medicine) => (
                            <tr key={medicine.id}>
                              <td>
                                <div className="medicine-name">
                                  <div className="medicine-icon">
                                    ✚
                                  </div>

                                  <div>
                                    <strong>{medicine.name}</strong>
                                    <small>{medicine.batch}</small>
                                  </div>
                                </div>
                              </td>

                              <td>{medicine.category}</td>

                              <td>
                                <strong>{medicine.stock}</strong>
                              </td>

                              <td>{medicine.expiry}</td>

                              <td>
                                <span
                                  className={`status ${
                                    medicine.stock <= 20
                                      ? "low"
                                      : "available"
                                  }`}
                                >
                                  {medicine.stock <= 20
                                    ? "Low Stock"
                                    : "Available"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="panel alert-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Expiry Alerts</h3>
                      <p>Medicines requiring attention</p>
                    </div>

                    <div className="alert-count">
                      {expiringSoon.length}
                    </div>
                  </div>

                  {expiringSoon.length === 0 ? (
                    <div className="empty-alert">
                      <div>✓</div>
                      <p>No medicines expiring soon.</p>
                    </div>
                  ) : (
                    <div className="alert-list">
                      {expiringSoon.map((medicine) => (
                        <div
                          className="alert-item"
                          key={medicine.id}
                        >
                          <div className="alert-medicine-icon">
                            !
                          </div>

                          <div>
                            <strong>{medicine.name}</strong>
                            <p>Expires {medicine.expiry}</p>
                          </div>

                          <span>Check</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activePage === "Medicines" && (
            <div className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h3>Medicine Inventory</h3>
                  <p>Manage all medicines in your pharmacy</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowAdd(true)}
                >
                  <Icon name="plus" />
                  Add Medicine
                </button>
              </div>

              <div className="medicine-search">
                <Icon name="search" />

                <input
                  type="text"
                  placeholder="Search by medicine, category or batch..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Batch</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMedicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td>
                          <div className="medicine-name">
                            <div className="medicine-icon">
                              ✚
                            </div>

                            <strong>{medicine.name}</strong>
                          </div>
                        </td>

                        <td>{medicine.category}</td>
                        <td>{medicine.batch}</td>
                        <td>{medicine.stock}</td>
                        <td>₹{medicine.price}</td>
                        <td>{medicine.expiry}</td>

                        <td>
                          <span
                            className={`status ${
                              medicine.stock <= 20
                                ? "low"
                                : "available"
                            }`}
                          >
                            {medicine.stock <= 20
                              ? "Low Stock"
                              : "Available"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage !== "Dashboard" &&
            activePage !== "Medicines" && (
              <div className="coming-soon">
                <div className="coming-icon">
                  <Icon
                    name={
                      navigation.find(
                        (item) => item.name === activePage
                      )?.icon
                    }
                  />
                </div>

                <h2>{activePage}</h2>

                <p>
                  This module is ready for integration with your
                  MediStock backend.
                </p>

                {activePage === "Sales" && (
                  <button
                    className="primary-button"
                    onClick={() => setActivePage("Medicines")}
                  >
                    Go to Inventory <Icon name="arrow" />
                  </button>
                )}
              </div>
            )}
        </section>
      </main>

      {showAdd && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add New Medicine</h2>
                <p>Enter medicine details below</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowAdd(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine Name</label>

                  <input
                    type="text"
                    placeholder="e.g. Paracetamol 500mg"
                    value={newMedicine.name}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        name: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    value={newMedicine.category}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        category: event.target.value,
                      })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="Pain Relief">
                      Pain Relief
                    </option>
                    <option value="Antibiotic">
                      Antibiotic
                    </option>
                    <option value="Allergy">Allergy</option>
                    <option value="Supplements">
                      Supplements
                    </option>
                    <option value="Tablet">Tablet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Batch Number</label>

                  <input
                    type="text"
                    placeholder="e.g. PCM2026F"
                    value={newMedicine.batch}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        batch: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicine.stock}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        stock: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>

                  <input
                    type="date"
                    value={newMedicine.expiry}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        expiry: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicine.price}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        price: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Icon name="plus" />
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;