import React from "react";
import { HStack, Flex, Text, Link, Box, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import distillLogo from "../assets/distill-logo.svg";
import { Home, WalletCards, Files } from "lucide-react";

const Navbar = () => {
  const navItems = [
    { name: "Home", path: "/", icon: <Home /> },
    { name: "All Studies", path: "/all-studies", icon: <WalletCards /> },
    {name: "Multi Study", path:"/multistudy", icon:<Files />},

  ];

  return (
    <HStack
      borderBottom="1px dotted #d9d9d9"
      px="40px"
      py="20px"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(8px)"
      position="relative"
      zIndex="10"
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
          <Button
            as={NavLink}
            key={item.name}
            to={item.path}
            bg="#f5f7fa"
            _hover={{ bg: "#d0ddef" }}
            _active={{ bg: "#c0cde0" }}
            _focus={{ outline: "none" }}
            mx="10px"
            borderRadius="md"
            fontSize="15px"
            fontWeight="light"
            transition="background-color 0.2s"
            color="black" // Use black for all text
            leftIcon={React.cloneElement(item.icon, {
              color: "#4F4F4F", // Use black for all icons
              size: "1.2em",
            })}
            textTransform="capitalize"
            style={({ isActive }) => ({
              color: isActive ? "gray.800" : "gray.600",
              backgroundColor: isActive && "#e0eafc",
              border: isActive && "1px solid rgba(0,0,255,0.15)",
            })}
          >
            {item.name}
          </Button>
        ))}
      </Flex>
    </HStack>
  );
};

export default Navbar;
