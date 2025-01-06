import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Text, Flex, Image, Tag, Icon, Skeleton } from "@chakra-ui/react";
import { fetchFigureData } from "../master_gen";
import BoxPlotTable from "../../explorer/boxplot/cell/BoxPlotTable";
import EnrichmentTable from "../../explorer/enrichment-analysis/EnrichmentTable"; // Adjust the import path
import DgeTables from "../../explorer/dge-analysis/DgeTables";
import { getStudyData } from "../utils";
import Breadcrumb from "../../BreadCrumb";
import CellUmap from "../../explorer/umaps/CellUmap";

const ObservationDetail = () => {
  const { studyId, nodeId, observationId } = useParams();
  const [study, setStudy] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [observationData, setObservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [figuresData, setFiguresData] = useState([]);

  useEffect(() => {
    getStudyData(studyId, nodeId, setStudy, setActiveNode);
  }, [studyId, nodeId]);

  useEffect(() => {
    const fetchObservationDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/observations/${observationId}`);
        console.log(response.data);

        setObservationData(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching observation detail:", error);
        setError("Failed to load observation detail. Please try again later.");
        return null;
      } finally {
        setLoading(false);
      }
    };

    const fetchFiguresData = async (figures) => {
      const results = figures.map((figure) => ({
        ...figure,
        loading: true,
        data: null,
        error: null,
      }));

      setFiguresData(results);

      for (const figure of figures) {
        try {
          const data = await fetchFigureData(
            figure.fig_type,
            figure.config,
            figure,
            nodeId
          );
          setFiguresData((prevFigures) =>
            prevFigures.map((fig) =>
              fig.id === figure.id ? { ...fig, data, loading: false } : fig
            )
          );
        } catch (err) {
          console.error(`Error fetching data for figure ${figure.id}:`, err);
          setFiguresData((prevFigures) =>
            prevFigures.map((fig) =>
              fig.id === figure.id
                ? {
                    ...fig,
                    loading: false,
                    error: "Error fetching figure data",
                  }
                : fig
            )
          );
        }
      }
    };

    const loadData = async () => {
      const data = await fetchObservationDetail();
      if (data?.figures) {
        fetchFiguresData(data.figures);
      }
    };

    if (observationId) {
      loadData();
    } else {
      setError("Observation ID is missing or undefined.");
    }
  }, [observationId]);

  const observationType = figuresData[0]?.observation_type || "";

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const breadcrumbItems = [
    { label: "All Studies", href: "/all-studies" },
    { label: study?.human_readable_study_id || "Loading..." },
    { label: activeNode?.node_label || "Loading..." },
    {
      label: "Observations",
      href: `/study/${studyId}/observations/${nodeId}`,
    },
    { label: "Observation" },
  ];

  return (
    <Box p={8}>
      <Breadcrumb items={breadcrumbItems} />

      <Text fontSize="sm" color="gray.600" mb={2}>
        {new Date(observationData?.created_on).toLocaleDateString()} &bull;
        Study: {study?.human_readable_study_id}
      </Text>

      <Text fontWeight="bold" fontSize="24px" mb={4}>
        {observationData?.title}
      </Text>

      {observationData?.diseases?.map((disease, index) => (
        <Tag
          key={index}
          colorScheme="blue"
          mr={2}
          borderRadius="full"
          variant="outline"
        >
          {disease}
        </Tag>
      ))}

      {observationType && (
        <Tag colorScheme="teal" mr={2} borderRadius="full" variant="outline">
          {observationType}
        </Tag>
      )}

      {/* {observationData?.created_by && (
        <Tag colorScheme="gray" mr={2} borderRadius="full" variant="outline">
          #{observationData.created_by}
        </Tag>
      )} */}

      <Text bg="gray.50" p={4} mt={4} borderRadius="md" fontSize="md">
        {observationData?.description}
      </Text>

      {figuresData.map((figure, index) => (
        <Box
          key={index}
          mt={8}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
        >
          <Flex alignItems="center" mb={4}>
            <Flex alignItems="center" mr={4}>
              {figure.scope.map((scopeItem, index) => (
                <Tag
                  key={index}
                  colorScheme="blue"
                  mr={2}
                  borderRadius="full"
                  variant="outline"
                >
                  {scopeItem}
                </Tag>
              ))}
            </Flex>
            <Flex alignItems="center" mr={4}>
              <Tag colorScheme="cyan" borderRadius="full" variant="outline">
                {figure.fig_type.toUpperCase()}
              </Tag>
            </Flex>
            <Tag colorScheme="gray" borderRadius="full" variant="outline">
              {figure.comparison.join(" vs ")}
            </Tag>
          </Flex>

          <Box mt={4}>
            {figure.loading ? (
              <Skeleton height="400px" />
            ) : figure.data?.screenshot ? (
              <Image
                src={figure.data.screenshot}
                alt={`${figure.fig_type} screenshot`}
              />
            ) : (
              <Skeleton height="400px" />
            )}
          </Box>

          <Text bg="gray.50" p={4} mt={4} borderRadius="md" mb={4}>
            {figure.caption}
          </Text>

          {figure.fig_type === "cell_boxplot" && figure.data?.plotData && (
            <BoxPlotTable plotData={figure.data.plotData} mode={"split"} />
          )}

          {figure.fig_type === "enrichment" &&
            figure.data?.tableDataEnrichment && (
              <EnrichmentTable tableData={figure.data.tableDataEnrichment} />
            )}

          {figure.fig_type === "dge" && figure.data?.dgeData && (
            <DgeTables
              data={figure.data.dgeData}
              initialFoldChangeThreshold={
                figure.data.initialFoldChangeThreshold
              }
              initialSignificanceThreshold={
                figure.data.initialSignificanceThreshold
              }
            />
          )}

          {figure.error && <Text color="red.500">Error: {figure.error}</Text>}
        </Box>
      ))}
    </Box>
  );
};

export default ObservationDetail;
