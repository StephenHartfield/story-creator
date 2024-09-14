import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProjectStore from "../stores/ProjectStore";
import useReferenceStore, { Reference } from "../stores/ReferenceStore";
import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import SingleScreenEdit from "../screens/SingleScreenEdit";
import { Button } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface ReferenceProps {
  userId: string;
}

const References: React.FC<ReferenceProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [colorsToUse, setColorsToUse] = useState<string[]>([]);
  const { activeProject } = useProjectStore();
  const { references, updateReferences, addReference } = useReferenceStore();

  useEffect(() => {
    if (activeProject) {
      const fromTheme = [...colorsToUse];
      const storedColors = localStorage.getItem(`${activeProject.id}-stored-colors`);
      if (storedColors) {
        const toArray = storedColors.split(",");
        const combinedArray = [...new Set([...toArray, ...activeProject.themeColors])];
        setColorsToUse(combinedArray);
      } else {
        setColorsToUse(fromTheme);
      }
    }
  }, [activeProject]);

  const handleAddColorsToUse = (val: string) => {
    if (activeProject) {
      const updatedThemeColors = [...colorsToUse, val];
      if (updatedThemeColors.length > 8) {
        const copy = [...colorsToUse];
        const notThemedColors = copy.filter((c) => !activeProject.themeColors.includes(c));
        notThemedColors.shift();
        notThemedColors.push(val);
        const newCombined = [...activeProject.themeColors].concat([...notThemedColors]);
        const toStorage = newCombined.map((c) => c).join(",");
        localStorage.setItem(`${activeProject.id}-stored-colors`, toStorage);
        setColorsToUse(newCombined);
      } else {
        const toStorage = updatedThemeColors.map((c) => c).join(",");
        localStorage.setItem(`${activeProject.id}-stored-colors`, toStorage);
        setColorsToUse(updatedThemeColors);
      }
    }
  };

  const createReferenceHandle = async () => {
    if (!userId) {
      console.error("Not logged in");
      return;
    }
    setIsLoading(true);
    const newReference: any = {
      text: "",
      image: "",
      imageLocal: "",
      projectId: activeProject?.id,
      requirements: [],
    };
    await addReference(newReference);
    setIsLoading(false);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const itemList = references.concat();
    const [removed]: Reference[] = itemList.splice(source.index, 1);
    itemList.splice(destination.index, 0, removed);
    updateReferences(itemList);
  };

  return (
    <>
      {activeProject ? (
        <FormContainer>
          <Title>References</Title>
          <SectionsContainer>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="rows">
                {(provided: any) => (
                  <div ref={provided.innerRef} className="rows">
                    {references.map((reference, index) => (
                      <Draggable key={`${reference.id}-${index}`} draggableId={`${reference.id}-${index}`} index={index}>
                        {(provided: any) => (
                          <div
                            style={{
                              userSelect: "none",
                              ...provided.draggableProps.style,
                            }}
                            ref={provided.innerRef}
                            {...provided.draggableProps}>
                            <SingleScreenEdit
                              dragHandleProps={provided.dragHandleProps}
                              key={reference.id + index}
                              reference={reference}
                              index={index}
                              colorsToUse={colorsToUse}
                              handleAddColorsToUse={handleAddColorsToUse}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </SectionsContainer>
          <AddButton type="button" onClick={createReferenceHandle}>
            Add Reference
          </AddButton>
        </FormContainer>
      ) : (
        <span>No Active Project</span>
      )}
    </>
  );
};

export default References;

const Title = styled.h2``;

const FormContainer = styled.div`
  max-width: 800px;
  width: 700px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionsContainer = styled.div`
  margin-bottom: 20px;
  width: 700px;
`;

const AddButton = styled(Button)`
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 5px 15px;

  &:hover {
    background-color: #0056b3;
  }
`;
