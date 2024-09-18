import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Button, Typography } from "@mui/material";
import Select from "react-dropdown-select";
import useCurrencyStore from "../stores/CurrencyStore";
import { Option } from "../replies/RepliesCreator";

export interface ReferRequirement {
  startsWith: boolean;
  type: string;
  value: number | boolean | undefined;
  keyWord: string;
  greaterThan?: boolean;
}

interface RequirementProps {
  addRequirement: (req: ReferRequirement) => void;
}

const ReferenceRequirement: React.FC<RequirementProps> = ({ addRequirement }) => {
  const [startsWith, setStartsWith] = useState<boolean>();
  const [requirementType, setRequirementType] = useState<"currency" | "item">();
  const [value, setValue] = useState<number | boolean>();
  const [proceeded, setProceeded] = useState<boolean>();
  const [keyWord, setKeyWord] = useState<any[]>([]);
  const [keyWordToSave, setKeyWordToSave] = useState<string>();
  const [greaterThan, setGreaterThan] = useState<boolean>();
  const [toFinal, setToFinal] = useState<boolean>();
  const [currencyOpts, setCurrencyOpts] = useState<Option[]>([]);
  const { currencies } = useCurrencyStore();

  useEffect(() => {
    if (startsWith) {
      addRequirement({ startsWith: true, type: "", value: 0, keyWord: "" });
      setStartsWith(undefined);
    }
  }, [startsWith]);

  useEffect(() => {
    if (currencies.length) {
      setCurrencyOpts(currencies.map((c) => ({ value: c.keyWord, label: c.displayName })));
    }
  }, [currencies]);

  const undo = (step: number) => {
    if (step === 1) {
      setStartsWith(undefined);
    } else if (step === 2) {
      setRequirementType(undefined);
    } else if (step === 3) {
      setValue(undefined);
      setProceeded(false);
    } else if (step === 4) {
      setToFinal(false);
      if (!greaterThan) {
        setProceeded(false);
      }
    }
  };

  const handleKeyWord = (opt: any[]) => {
    setKeyWord(opt as any[]);
    setKeyWordToSave(opt[0].value);
  };

  const handleGreaterThan = (v: boolean) => {
    setGreaterThan(v);
    setToFinal(true);
  };

  const handleCurrency = (currency: string) => {
    setValue(parseInt(currency));
  };

  const handlePossession = (possesses: boolean) => {
    setValue(possesses);
    proceed();
  };

  const proceed = () => {
    setProceeded(true);
  };

  const complete = () => {
    const completed: any = { startsWith: false, type: requirementType, value, keyWord: keyWordToSave };
    if (greaterThan !== undefined) {
      completed["greaterThan"] = greaterThan;
    }
    addRequirement(completed);
    setStartsWith(undefined);
    setRequirementType(undefined);
    setValue(undefined);
    setKeyWord([]);
    setKeyWordToSave(undefined);
    setProceeded(undefined);
    setToFinal(undefined);
    setGreaterThan(undefined);
  };

  if (typeof startsWith === "undefined") {
    return (
      <ButtonsWrapper>
        <StyledButton variant="outlined" onClick={() => setStartsWith(true)}>
          Starts With It
        </StyledButton>
        <StyledButton variant="outlined" onClick={() => setStartsWith(false)}>
          Add Requirement
        </StyledButton>
      </ButtonsWrapper>
    );
  }

  if (startsWith === false && !requirementType) {
    return (
      <ButtonsWrapper>
        <InstructionText>Choose Requirement</InstructionText>
        <StyledButton variant="outlined" onClick={() => setRequirementType("currency")}>
          Currency
        </StyledButton>
        <StyledButton variant="outlined" onClick={() => setRequirementType("item")}>
          Item
        </StyledButton>
        <StyledButton $back variant="outlined" onClick={() => undo(1)}>
          BACK
        </StyledButton>
      </ButtonsWrapper>
    );
  }

  if (startsWith === false && requirementType && !proceeded && !toFinal) {
    return (
      <ButtonsWrapper>
        <InstructionText>Choose How much to gain or lose</InstructionText>
        {requirementType === "currency" && (
          <>
            <CurrencyInput type="number" pattern="[0-9]*" onChange={(e) => handleCurrency(e.target.value)} />
            {value && (
              <StyledButton variant="outlined" onClick={() => setProceeded(true)}>
                ENTER
              </StyledButton>
            )}
          </>
        )}
        {requirementType === "item" && (
          <>
            <StyledButton variant="outlined" onClick={() => handlePossession(true)}>
              "Possesses Item"
            </StyledButton>
            <StyledButton variant="outlined" onClick={() => handlePossession(false)}>
              "NOT in Possession"
            </StyledButton>
          </>
        )}
        <StyledButton $back variant="outlined" onClick={() => undo(2)}>
          BACK
        </StyledButton>
      </ButtonsWrapper>
    );
  }

  if (startsWith === false && requirementType === "currency" && proceeded && !toFinal) {
    return (
      <ButtonsWrapper>
        <InstructionText>Needs Currency Above or Below?</InstructionText>
        <StyledButton variant="outlined" onClick={() => handleGreaterThan(true)}>
          More Than {value}
        </StyledButton>
        <StyledButton variant="outlined" onClick={() => handleGreaterThan(false)}>
          Less Than {value}
        </StyledButton>
        <StyledButton $back variant="outlined" onClick={() => undo(3)}>
          BACK
        </StyledButton>
      </ButtonsWrapper>
    );
  } else if ((startsWith === false || requirementType !== "currency") && proceeded && !toFinal) {
    setToFinal(true);
  }

  if (startsWith === false && requirementType && proceeded && toFinal) {
    return (
      <ButtonsWrapper>
        <InstructionText>Enter Keyword for {requirementType} to check</InstructionText>
        <Select options={currencyOpts} values={keyWord} onChange={(values: any[]) => handleKeyWord(values)} />
        {/* <CurrencyInput type="text" placeholder='' onChange={(e) => handleKeyWord(e.target.value)} /> */}
        <StyledButton variant="outlined" onClick={complete}>
          COMPLETE
        </StyledButton>
        <StyledButton $back variant="outlined" onClick={() => undo(4)}>
          BACK
        </StyledButton>
      </ButtonsWrapper>
    );
  }
};

export default ReferenceRequirement;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #f0f8ff;
  border: 2px solid #0073e6;
  border-radius: 8px;
  min-width: 400px;
`;

const InstructionText = styled(Typography)`
  font-size: 16px;
  font-weight: bold;
  color: #003366;
`;

const StyledButton = styled(Button)<{ $back?: boolean }>`
  && {
    background-color: ${(props) => (props.$back ? "red" : "#005cbf")};
    color: white;
    &:hover {
      background-color: ${(props) => (props.$back ? "darkred" : "#004080")};
    }
  }
`;

const CurrencyInput = styled.input`
  padding: 8px;
  border: 2px solid #0073e6;
  border-radius: 4px;
  width: 50%;
  margin-top: 8px;
  background-color: #e6f7ff;
  color: #003366;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #005cbf;
  }
`;
