import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Typography } from '@mui/material';
import { Requirement } from './replies/RepliesCreator';

interface RequirementProps {
    addRequirement: (req: Requirement) => void;
}

const RequirementHandler: React.FC<RequirementProps> = (props: RequirementProps) => {
    const [addonSelector, setAddonSelector] = useState<'requirement' | 'effect'>();
    const [requirementType, setRequirementType] = useState<'currency' | 'item'>();
    const [value, setValue] = useState<number | boolean>();
    const [proceeded, setProceeded] = useState<boolean>();
    const [keyWord, setKeyWord] = useState<string>();
    const [greaterThan, setGreaterThan] = useState<boolean>();
    const [toFinal, setToFinal] = useState<boolean>();

    const createRequirement = (type: 'requirement' | 'effect') => {
        setAddonSelector(type);
    }

    const chooseType = (type: 'currency' | 'item') => {
        setRequirementType(type);
    }

    const handleCurrency = (currency: string) => {
        setValue(parseInt(currency));
    }

    const handlePossession = (possesses: boolean) => {
        setValue(possesses);
        proceed();
    }

    const proceed = () => {
        setProceeded(true);
    }

    const handleGreaterThan = (v: boolean) => {
        setGreaterThan(v);
        setToFinal(true);
    }

    const handleKeyWord = (kw: string) => {
        setKeyWord(kw);
    }

    const complete = () => {
        const completed: any = { addedAs: addonSelector, type: requirementType, value, keyWord };
        if (greaterThan !== undefined) {
            completed['greaterThan'] = greaterThan; 
        }
        props.addRequirement(completed);
        setAddonSelector(undefined);
        setRequirementType(undefined);
        setValue(undefined);
        setKeyWord(undefined);
        setProceeded(undefined);
        setToFinal(undefined);
        setGreaterThan(undefined);
    }

    const undo = (step: number) => {
        if (step === 1) {
            setAddonSelector(undefined);
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
    }

    if (!addonSelector) {
        return (
            <ButtonsWrapper>
                <StyledButton variant="outlined" onClick={() => createRequirement('requirement')}>
                    Requirement
                </StyledButton>
                <StyledButton variant="outlined" onClick={() => createRequirement('effect')}>
                    Effect
                </StyledButton>
            </ButtonsWrapper>
        )
    }

    if (addonSelector && !requirementType && !proceeded && !toFinal) {
        return (
            <ButtonsWrapper>
                <InstructionText>Choose {addonSelector}</InstructionText>
                <StyledButton variant="outlined" onClick={() => chooseType('currency')}>
                    Currency
                </StyledButton>
                <StyledButton variant="outlined" onClick={() => chooseType('item')}>
                    Item
                </StyledButton>
                <StyledButton $back variant="outlined" onClick={() => undo(1)}>
                    BACK
                </StyledButton>
            </ButtonsWrapper>
        )
    }

    if (addonSelector && requirementType && !proceeded && !toFinal) {
        return (
            <ButtonsWrapper>
                <InstructionText>Choose {requirementType} {addonSelector}</InstructionText>
                {requirementType === 'currency' && (
                    <>
                        <CurrencyInput type="text" pattern="[0-9]*" onChange={(e) => handleCurrency(e.target.value)} />
                        {value && <StyledButton variant="outlined" onClick={proceed}>
                            ENTER
                        </StyledButton>}
                    </>
                )}
                {requirementType === 'item' && (
                    <>
                        <StyledButton variant="outlined" onClick={() => handlePossession(true)}>
                            {addonSelector === 'requirement' ? 'Possesses Item' : 'Gains Item'}
                        </StyledButton>
                        <StyledButton variant="outlined" onClick={() => handlePossession(false)}>
                            {addonSelector === 'requirement' ? 'NOT in Possession' : 'Loses Item'}
                        </StyledButton>
                    </>
                )}
                <StyledButton $back variant="outlined" onClick={() => undo(2)}>
                    BACK
                </StyledButton>
            </ButtonsWrapper>
        )
    }

    if (addonSelector === 'requirement' && requirementType === 'currency' && proceeded && !toFinal) {
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
        )
    } else if ((addonSelector !== 'requirement' || requirementType !== 'currency') && proceeded && !toFinal) {
        setToFinal(true);
    }

    if (addonSelector && requirementType && proceeded && toFinal) {
        return (
            <ButtonsWrapper>
                <InstructionText>Enter Keyword for {requirementType} to check</InstructionText>
                <CurrencyInput type="text" placeholder='' onChange={(e) => handleKeyWord(e.target.value)} />
                <StyledButton variant="outlined" onClick={complete}>
                    COMPLETE
                </StyledButton>
                <StyledButton $back variant="outlined" onClick={() => undo(4)}>
                    BACK
                </StyledButton>
            </ButtonsWrapper>
        )
    }
}

export default RequirementHandler;

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

const StyledButton = styled(Button) <{ $back?: boolean}> `
  && {
    background-color: ${props => props.$back ? 'red' : '#005cbf'};
    color: white;
    &:hover {
      background-color: ${props => props.$back ? 'darkred' : '#004080'};
    }
  }
`;

const CurrencyInput = styled.input`
  padding: 8px;
  border: 2px solid #0073e6;
  border-radius: 4px;
  width: 100%;
  margin-top: 8px;
  background-color: #e6f7ff;
  color: #003366;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #005cbf;
  }
`;
