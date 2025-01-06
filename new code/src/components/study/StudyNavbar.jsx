import React from "react";
import { Button, HStack, Flex } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import distillLogo from "../../assets/distill-logo.svg";
import { FaSitemap } from "react-icons/fa";
import { ExternalLink, Eye, FileText } from "lucide-react";

const StudyNavbar = ({ studyId, nodeId, showPipeline, setShowPipeline }) => {
  const navItems = [
    {
      name: "Pipeline Flow",
      icon: <FaSitemap className="w-4 h-4" />,
      handleClick: togglePipelineVisiblity,
    },
    {
      name: "Summary",
      icon: <FileText className="w-4 h-4" />,
      path: `/study/${studyId}/summary/${nodeId}`,
      handleClick: hidePipeLine,
    },
    {
      name: "observations",
      icon: <Eye className="w-5 h-5" />,
      path: `/study/${studyId}/observations/${nodeId}`,
      handleClick: hidePipeLine,
    },
    {
      name: "explore",
      icon: <ExternalLink className="w-4 h-4" />,
      handleClick: navigateToExplorer,
    },
  ];
  // Filter the nav items based on whether nodeId is provided
  const filteredNavItems = nodeId
    ? navItems
    : navItems.filter((item) => item.name === "Flow Chart");

  function togglePipelineVisiblity() {
    setShowPipeline(!showPipeline);
  }
  function hidePipeLine() {
    setShowPipeline(false);
  }

  function navigateToExplorer() {
    window.open(`/study/${studyId}/explorer/${nodeId}`, "_blank");
  }

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
        {filteredNavItems.map((item) => (
          <Button
            as={item.path ? NavLink : "button"}
            onClick={item.handleClick}
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
            style={
              item.path
                ? ({ isActive }) => ({
                    color: isActive ? "gray.800" : "gray.600",
                    backgroundColor: isActive && "#e0eafc",
                    border: isActive && "1px solid rgba(0,0,255,0.15)",
                  })
                : {}
            }
          >
            {item.name}
          </Button>
        ))}
      </Flex>
    </HStack>
  );
};

export default StudyNavbar;
