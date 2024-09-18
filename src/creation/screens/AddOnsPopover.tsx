import React, { useState } from "react";
import { Popover, Button } from "@mui/material";
import styled from "@emotion/styled";

interface ActionButtonsProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleRequirementsPopup: () => void;
  reference: { id: string } | undefined;
}

const AddOnsPopover: React.FC<ActionButtonsProps> = ({ handleImageUpload, toggleRequirementsPopup, reference }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const buttonClick = (type: "image" | "sound" | "requirements") => {
    if (type === "image") {
    } else if (type === "sound") {
      console.log("sound");
    } else if (type === "requirements") {
      toggleRequirementsPopup();
    }
    handleClose();
  };

  const imageHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        Add-Ons
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}>
        <ActionButtons>
          <input type="file" accept="image/*" onChange={imageHandle} style={{ display: "none" }} id="upload" />
          <ActionButton style={{ textAlign: "center" }} as="label" htmlFor="upload">
            Add Image
          </ActionButton>
          <ActionButton type="button">Add Sound</ActionButton>
          {reference?.id && <ActionButton onClick={() => buttonClick("requirements")}>Requirements</ActionButton>}
        </ActionButtons>
      </Popover>
    </div>
  );
};

export default AddOnsPopover;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 8px;
`;

const ActionButton = styled.button<{ isSave?: boolean }>`
  background-color: ${(props) => (props.isSave ? "#4CAF50" : "#1976D2")};
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.isSave ? "#45A049" : "#1565C0")};
  }
`;

const RemoveButton = styled(ActionButton)`
  background-color: #f44336;

  &:hover {
    background-color: #d32f2f;
  }
`;
