import React from "react";
import { NavLink } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

// Example of a breadcrumb item
// const breadcrumbItems = [
//   { label: "item1", href: "#" },
//   { label: "item2" },
//   { label: "item3", href: "#" },
// ];

const Breadcrumb = ({
  items,
  separator = <FaChevronRight className="h-4 w-4" />,
}) => {
  return (
    items.length !== 0 && (
      <nav aria-label="Breadcrumb" className="text-sm mb-4">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">{separator}</span>
              )}
              {item.href ? (
                <NavLink
                  to={item.href}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  {item.label}
                </NavLink>
              ) : (
                <span
                  className="text-gray-700"
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  );
};

export default Breadcrumb;
