import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  let breadcrumbPath = "";

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div className="breadcrumbs">
      {pathnames.map((name, index) => {
        breadcrumbPath += `${name}`;
        const isLast = index === pathnames.length - 2;
        console.log(pathnames, breadcrumbPath);

        console.log("Pathnames:", pathnames);
        console.log("Breadcrumb Path:", breadcrumbPath);

        return isLast ? (
          <span>
            {" "}
            <Link to={1}>{"/ " + capitalizeFirstLetter(name)}</Link>
          </span>
        ) : (
          <span key={breadcrumbPath}>
            {" "}
            <Link to={-1}>{capitalizeFirstLetter(name)}</Link>
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
