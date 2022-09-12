const LibraryTable = ({ service }: { service: Service }) => {
  return (
    <div>
      <h3>{service.name}</h3>
      {service.logo == null ? null : (
        <img style={{ maxHeight: 60 }} src={service.logo} alt="logo" />
      )}
    </div>
  );
};
