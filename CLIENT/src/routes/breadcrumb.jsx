import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = (props) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  let breadcrumbPath = "";

  function capitalizeFirstLetter(string) {
    return parseInt(string)
      ? ""
      : string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div className="breadcrumbs">
      {pathnames.map((name, index) => {
        breadcrumbPath += `${name}`;
        const isLast = index === pathnames.length - 2;

        return isLast ? (
          <span>
            {" "}
            <Link to={1}>{"/ " + capitalizeFirstLetter(props.name)}</Link>
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
