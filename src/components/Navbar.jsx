import React from "react";
import { HStack, Flex, Text, Link, Box } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import distillLogo from "../assets/distill-logo.svg";

const Navbar = () => {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explorer", path: "/explorer" },
  ];

  return (
    <HStack
      borderBottom="1px dotted #d9d9d9"
      px="40px"
      py="20px"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      bg="white"
    >
      {/* Left-Aligned: Logo and Title */}
      <Flex alignItems="center">
        <NavLink to="/">
          <img src={distillLogo} alt="Logo" style={{ width: "220px" }} />
        </NavLink>
      </Flex>

      {/* Right-Aligned: Navigation Links */}
      <Flex>
        {navItems.map((item) => (
          <Link
            as={NavLink}
            key={item.name}
            to={item.path}
            ml="20px"
            fontSize="16px"
            color="gray.600"
            _hover={{
              textDecoration: "none",
              color: "gray.800",
            }}
            _focus={{ boxShadow: "none" }}
            style={({ isActive }) => ({
              color: isActive ? "gray.800" : "gray.600",
              borderBottom: isActive ? "2px solid #7b0000" : "none",
            })}
          >
            {item.name}
          </Link>
        ))}
      </Flex>
    </HStack>
  );
};

export default Navbar;