export const getBasePath = () =>
  location.pathname.slice(
    0,
    location.pathname.indexOf(location.pathname.match(/\/[a-z]{2}\//)[0]),
  );
