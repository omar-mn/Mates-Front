function PlaceholderPage({ title, description }) {
  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h2 className="mb-3">{title}</h2>
        <p className="mb-0 text-secondary">{description}</p>
      </div>
    </div>
  );
}

export default PlaceholderPage;
