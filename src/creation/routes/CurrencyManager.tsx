import React, { useState } from 'react';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import useProjectStore from '../stores/ProjectStore';
import useCurrencyStore from '../stores/CurrencyStore';

const CurrencyManager: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [keyWord, setKeyWord] = useState('');
  const [startingValue, setStartingValue] = useState<number | ''>('');
  const {activeProject} = useProjectStore();
  const {currencies, addCurrency, deleteCurrency} = useCurrencyStore();

  const addCurrencyHandle = async() => {
    if (displayName && keyWord && startingValue !== '') {
      const newCurrency = { displayName, keyWord, startingValue: Number(startingValue), projectId: activeProject?.id };
      addCurrency(newCurrency);
      setDisplayName('');
      setKeyWord('');
      setStartingValue('');
    }
  };

  return (
    <Container>
      <Form>
        <Input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Key Word"
          value={keyWord}
          onChange={(e) => setKeyWord(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Starting Value"
          value={startingValue}
          onChange={(e) => setStartingValue(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <AddButton onClick={addCurrencyHandle}>Add Currency</AddButton>
      </Form>
      <CurrencyList>
        {currencies.map((currency, index) => (
          <CurrencyTag key={index}>
            {currency.displayName} ({currency.keyWord}, {currency.startingValue})
            <DeleteButton onClick={() => deleteCurrency(currency.id)}>
              <DeleteIcon />
            </DeleteButton>
          </CurrencyTag>
        ))}
      </CurrencyList>
    </Container>
  );
};

export default CurrencyManager;

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const AddButton = styled.button`
  padding: 10px;
  background-color: #FFD700;
  color: purple;
  border: 2px solid purple;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: purple;
    color: #FFD700;
    border-color: #FFD700;
  }
`;

const CurrencyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const CurrencyTag = styled.div`
  display: flex;
  align-items: center;
  background-color: #f1f1f1;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  margin-left: 10px;
  cursor: pointer;
  color: red;
  display: flex;
  align-items: center;
`;
