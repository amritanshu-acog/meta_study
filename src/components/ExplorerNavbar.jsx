import React from "react";
import { HStack, Flex, Button } from "@chakra-ui/react";
import { FaChartBar, FaDna, FaFlask } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import distillLogo from "../assets/distill-logo.svg";
import { FaChartSimple } from "react-icons/fa6";

const ExplorerNavbar = ({ activeComponent, setActiveComponent }) => {
  const navItems = [
    { name: "Cell Proportion", id: "cellProportion", icon: <FaChartBar /> },
    { name: "Gene Expression", id: "geneExpression", icon: <FaChartSimple /> },
    { name: "DGE Analysis", id: "dgeAnalysis", icon: <FaDna /> },
    { name: "Enrichment Analysis", id: "enrichmentAnalysis", icon: <FaFlask /> },
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
      {/* Left-Aligned: Logo */}
      <Flex alignItems="center">
        <NavLink to="/">
          <img src={distillLogo} alt="Logo" style={{ width: "220px" }} />
        </NavLink>
      </Flex>
      <Flex borderRadius="20px" align="center" justify="center">
        {navItems.map((item) => (
          <Button
            key={item.id}
            onClick={() => setActiveComponent(item.id)}
            bg={activeComponent === item.id ? "#e0eafc" : "#f5f7fa"}
            border={
              activeComponent === item.id && "1px solid rgba(0,0,255,0.15)"
            }
            _hover={{ bg: "#d0ddef" }}
            _active={{ bg: "#c0cde0" }}
            _focus={{ outline: "none" }}
            mx="10px"
            borderRadius="md"
            fontSize="15px"
            fontWeight="light"
            transition="background-color 0.2s"
            color="black"
            leftIcon={React.cloneElement(item.icon, {
              color: "#4F4F4F",
              size: "1em",
            })}
          >
            {item.name}
          </Button>
        ))}
      </Flex>
    </HStack>
  );
};

export default ExplorerNavbar;
