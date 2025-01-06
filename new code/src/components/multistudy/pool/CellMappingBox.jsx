import React, { useState, useEffect, useContext } from "react";
import { MappingContext } from "./MappingContext";
import {
  Box,
  HStack,
  Text,
  RadioGroup,
  Radio,
  VStack,
  Badge,
  Wrap,
  WrapItem,
  IconButton,
  Input,
  Button,
} from "@chakra-ui/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Edit, Trash } from "lucide-react";

const ItemTypes = {
  CHIP: "chip",
};

const DraggableChip = ({ chip, boxIndex, moveChip }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHIP,
    item: { chip, boxIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Badge
      ref={drag}
      variant="solid"
      opacity={isDragging ? 0.5 : 1}
      cursor="pointer"
      bg={chip.color}
      mb={1}
    >
      {chip.type}
    </Badge>
  );
};

const DroppableBox = ({
  box,
  index,
  moveChipToBox,
  editBoxTitle,
  deleteBox,
}) => {
  const [, drop] = useDrop({
    accept: ItemTypes.CHIP,
    drop: (item) => moveChipToBox(item.boxIndex, index, item.chip),
  });

  return (
    <Box
      ref={drop}
      borderWidth="1px"
      p={2}
      borderRadius="md"
      bg="gray.50"
      minW="150px"
      minH="100px"
    >
      <HStack justifyContent="space-between" mb={2}>
        <Input
          value={box.title}
          size="sm"
          onChange={(e) => editBoxTitle(index, e.target.value)}
          width="auto"
        />
        <HStack spacing={1}>
          <IconButton
            icon={<Trash size="16" />}
            colorScheme="gray"
            size="sm"
            onClick={() => deleteBox(index)}
          />
        </HStack>
      </HStack>
      <VStack align="start" spacing={2}>
        {box.chips.length > 0 ? (
          box.chips.map((chip, idx) => (
            <DraggableChip
              key={idx}
              chip={chip}
              boxIndex={index}
              moveChip={moveChipToBox}
            />
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">
            Empty
          </Text>
        )}
      </VStack>
    </Box>
  );
};

const CellMappingBox = ({ metadata, cellTypeLevel }) => {
  const [mappingActive, setMappingActive] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [initialBoxes, setInitialBoxes] = useState([]);
  const { saveCellLevelMapping } = useContext(MappingContext);

  const colorList = [
    "blue.400",
    "cyan.400",
    "yellow.400",
    "green.400",
    "red.300",
    "yellow.400",
    "gray.400",
    "teal.400",
    "purple.400",
    "orange.400",
    "pink.400",
  ];

  const studyColors = {};
  metadata.forEach((meta, index) => {
    studyColors[meta.studyReadableId] = colorList[index % colorList.length];
  });

  useEffect(() => {
    const uniqueCellTypes = {};
    metadata.forEach((meta) => {
      meta.celltypeData[cellTypeLevel].forEach((cellType) => {
        if (!uniqueCellTypes[cellType]) {
          uniqueCellTypes[cellType] = [];
        }
        uniqueCellTypes[cellType].push(meta.studyReadableId);
      });
    });

    const initial = Object.entries(uniqueCellTypes).map(([type, studies]) => ({
      title: type,
      chips: studies.map((studyId) => ({
        type,
        studyId,
        color: studyColors[studyId],
      })),
    }));

    setBoxes(initial);
    setInitialBoxes(JSON.parse(JSON.stringify(initial)));
  }, [metadata, cellTypeLevel]);

  const handleMappingChange = (value) => {
    setMappingActive(value === "yes");
  };

  const moveChipToBox = (fromBoxIndex, toBoxIndex, chip) => {
    if (fromBoxIndex === toBoxIndex) return;

    const fromBox = boxes[fromBoxIndex];
    const toBox = boxes[toBoxIndex];

    const updatedFromBoxChips = fromBox.chips.filter(
      (c) => c.type !== chip.type || c.studyId !== chip.studyId
    );
    const updatedToBoxChips = [...toBox.chips, chip];

    const updatedBoxes = boxes.map((box, idx) => {
      if (idx === fromBoxIndex) return { ...box, chips: updatedFromBoxChips };
      if (idx === toBoxIndex) return { ...box, chips: updatedToBoxChips };
      return box;
    });

    setBoxes(updatedBoxes);
  };

  const editBoxTitle = (index, title) => {
    setBoxes(
      boxes.map((box, idx) => (idx === index ? { ...box, title } : box))
    );
  };

  const deleteBox = (index) => {
    setBoxes(boxes.filter((_, idx) => idx !== index));
  };

  const resetBoxes = () => {
    setBoxes(JSON.parse(JSON.stringify(initialBoxes)));
  };

  const handleSave = () => {
    saveCellLevelMapping(cellTypeLevel, boxes);
    console.log(`Saved Mapping for ${cellTypeLevel}:`, boxes);
  };

  return (
    <Box mt={6} width="full">
      <HStack spacing={4} mb={4}>
        <Text fontWeight="bold">Do you want to map values:</Text>
        <RadioGroup
          onChange={(value) => handleMappingChange(value)}
          value={mappingActive ? "yes" : "no"}
        >
          <HStack spacing={4}>
            <Radio value="yes">YES</Radio>
            <Radio value="no">NO</Radio>
          </HStack>
        </RadioGroup>
      </HStack>

      {mappingActive && (
        <DndProvider backend={HTML5Backend}>
          <VStack align="start">
            <Text fontWeight="bold" mb={2}>
              Mapped celltypes:
            </Text>
            <Box p={4} borderWidth="1px" borderRadius="md" mb={4}>
              <Text fontWeight="bold" mb={2}>
                Legend
              </Text>
              {Object.entries(studyColors).map(([studyId, color]) => (
                <HStack key={studyId} mb={1}>
                  <Box w={3} h={3} bg={color} borderRadius="full" />
                  <Text>Study Id: #{studyId}</Text>
                </HStack>
              ))}
            </Box>

            <Wrap spacing={4} mt={4}>
              {boxes.map((box, index) => (
                <WrapItem key={index}>
                  <DroppableBox
                    box={box}
                    index={index}
                    moveChipToBox={moveChipToBox}
                    editBoxTitle={editBoxTitle}
                    deleteBox={deleteBox}
                  />
                </WrapItem>
              ))}
            </Wrap>
            <HStack mt={4} spacing={4}>
              <Button colorScheme="blue" onClick={handleSave}>
                Save
              </Button>
              <Button colorScheme="gray" onClick={resetBoxes}>
                Reset
              </Button>
            </HStack>
          </VStack>
        </DndProvider>
      )}
    </Box>
  );
};

export default CellMappingBox;
