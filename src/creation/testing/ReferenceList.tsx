import React, { Dispatch, SetStateAction, useState } from "react";
import styled from "@emotion/styled";
import { Popover, Button, Box } from "@mui/material";
import { UserCurrency } from "../routes/TestSingleScreen";
import useReferenceStore from "../stores/ReferenceStore";
import { ReferRequirement } from "../screens/ReferenceRequirement";

interface Props {
  setReferenceId: Dispatch<SetStateAction<string | undefined>>;
  toggleShowReference: () => void;
  userStats: { currencies: UserCurrency[] };
}

const ReferenceList: React.FC<Props> = ({ setReferenceId, toggleShowReference, userStats }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { references } = useReferenceStore();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const meetsRequirements = (refRequirements: ReferRequirement[]): boolean => {
    return refRequirements.every((req) => {
      if (req.startsWith) {
        return true;
      } else if (req.type === "currency") {
        const currencyToCheck = userStats.currencies.find((uc) => uc.currency.keyWord === req.keyWord);
        if (currencyToCheck) {
          return req.greaterThan ? currencyToCheck.userValue >= (req.value as number) : currencyToCheck.userValue <= (req.value as number);
        }
      }
      return false;
    });
  };

  const handleClick = (referenceId: string) => {
    toggleShowReference();
    setReferenceId(referenceId);
  };

  const open = Boolean(anchorEl);

  return (
    <Container>
      <Button style={{ width: "130px", backgroundColor: "purple" }} variant="contained" onClick={handleOpen}>
        {open ? "Close" : "References"}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}>
        <Dropdown>
          {references
            .filter((ref) => meetsRequirements(ref.requirements))
            .map((ref, index) => (
              <ReferenceTitle onClick={() => handleClick(ref.id)} key={"ref" + index}>
                {ref.title}
              </ReferenceTitle>
            ))}
        </Dropdown>
      </Popover>
    </Container>
  );
};

export default ReferenceList;

const Container = styled.div`
  display: inline-block;
`;

const Dropdown = styled(Box)`
  background-color: #2b2b2b;
  color: #fff;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
`;

const ReferenceTitle = styled.button`
  background-color: black;
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid #444;
  color: white;

  &:hover {
    background-color: #444;
  }
`;
