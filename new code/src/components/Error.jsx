import React from "react";
import PropTypes from "prop-types";
import { Text } from "@chakra-ui/react";

const Error = ({ errorMessage }) => {
  return <Text color="red.500">{errorMessage || "Error"}</Text>;
};

Error.propTypes = {
  errorMessage: PropTypes.string,
};

export default Error;
