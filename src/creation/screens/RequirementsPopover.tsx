import React, { useState } from "react";
import { Popover, Button, List, ListItem, ListItemText } from "@mui/material";

export interface ReferRequirement {
  startsWith: boolean;
  type: string;
  value: number | boolean | undefined;
  keyWord: string;
  greaterThan?: boolean;
}

interface RequirementsPopoverProps {
  requirements: ReferRequirement[];
}

const RequirementsPopover: React.FC<RequirementsPopoverProps> = ({ requirements }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "requirements-popover" : undefined;

  // Helper function to generate sentences for each requirement
  const generateRequirementSentence = (req: ReferRequirement) => {
    const startPhrase = req.startsWith ? "Starts with reference" : "";
    const comparisonPhrase = typeof req.greaterThan === "undefined" ? "" : req.greaterThan ? "greater than" : "less than";
    const value = typeof req.value === "boolean" ? "in possession" : typeof req.value === "number" ? req.value : "not in possession";
    return startPhrase ? startPhrase : `Needs ${req.keyWord.toUpperCase()}, ${comparisonPhrase} ${value}`;
  };

  return (
    <div>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        Requirements
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
        <List style={{ padding: "16px" }}>
          {requirements.map((req, index) => (
            <ListItem key={index}>
              <ListItemText primary={generateRequirementSentence(req)} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
};

export default RequirementsPopover;
