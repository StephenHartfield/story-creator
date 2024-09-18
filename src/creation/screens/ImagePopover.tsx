import React, { useState } from "react";
import { Popover, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styled from "@emotion/styled";

interface ImagePopoverProps {
  imageSrc: string;
  deleteImageHandle: () => void;
}

const ImagePopover: React.FC<ImagePopoverProps> = ({ imageSrc, deleteImageHandle }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "image-popover" : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        Has Image
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}>
        <ImageContainer>
          <StyledImg src={imageSrc} alt="Section Image" />
          <DeleteButton onClick={deleteImageHandle}>
            <DeleteIcon />
          </DeleteButton>
        </ImageContainer>
      </Popover>
    </div>
  );
};

export default ImagePopover;

// Styled Components

const ImageContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  padding: 5px;

  &:hover {
    background-color: rgba(255, 0, 0, 0.9);
  }
`;
