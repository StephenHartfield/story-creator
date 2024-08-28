import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import styled from '@emotion/styled';

// Define the structure of currencies, items, and enemies
interface Currency {
  name: string;
  amount: number;
}

interface Item {
  name: string;
  inPossession: boolean;
}

interface Enemy {
  name: string;
  health: number;
  damage: number;
  weakness: string;
  phrases: string[];
}

const AddOns: React.FC = () => {
  // State for lists of currencies, items, and enemies
  const [currencies, setCurrencies] = useState<Currency[]>([
    { name: 'Gold', amount: 100 },
    { name: 'Silver', amount: 500 },
  ]);

  const [items, setItems] = useState<Item[]>([
    { name: 'Sword', inPossession: true },
    { name: 'Shield', inPossession: false },
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([
    { name: 'Goblin', health: 100, damage: 10, weakness: 'Fire', phrases: ['Grunt', 'Screech'] },
    { name: 'Dragon', health: 1000, damage: 200, weakness: 'Ice', phrases: ['Roar', 'Breathes Fire'] },
  ]);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [currenciesOpen, setCurrenciesOpen] = useState<boolean>(false);
  const [itemsOpen, setItemsOpen] = useState<boolean>(false);
  const [enemiesOpen, setEnemiesOpen] = useState<boolean>(false);
  // Loops for battles - perhaps a configuration of how random the hits/damage is for crits and the like
  // transitions - can have requirement/effects
  // Game Title screen
  // Additional artwork
  // images could probably go here as well
  // maybe on replies / sections there can be a button  - ADD TO REUSABLES - and there's a list here of reusables
  // timers on single page and timers on collection of pages
  // save game sections

  // Toggle the main menu
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Toggle the dropdown for each section
  const toggleDropdown = (type: 'currencies' | 'items' | 'enemies') => {
    switch (type) {
      case 'currencies':
        setCurrenciesOpen(!currenciesOpen);
        break;
      case 'items':
        setItemsOpen(!itemsOpen);
        break;
      case 'enemies':
        setEnemiesOpen(!enemiesOpen);
        break;
      default:
        break;
    }
  };

    const addNewCurrency = () => {

    }
    const addNewItem = () => {

    }
    const addNewEnemy = () => {

    }

  return (
    <AddOnsContainer>
      {/* Hamburger button to toggle the list */}
      <IconButton onClick={toggleMenu}>
        <MenuIcon />
      </IconButton>

      {/* Dropdown list */}
      {menuOpen && (
        <ListContainer>
          <List>
            {/* Currencies Dropdown */}
            <ListItem button onClick={() => toggleDropdown('currencies')}>
              <ListItemText primary="Currencies" />
              {currenciesOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={currenciesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {currencies.map((currency, index) => (
                  <SubListItem key={index}>
                    <ListItemText primary={currency.name} />
                  </SubListItem>
                ))}
                <AddButton onClick={addNewCurrency}>Add Currency</AddButton>
              </List>
            </Collapse>

            {/* Items Dropdown */}
            <ListItem button onClick={() => toggleDropdown('items')}>
              <ListItemText primary="Items" />
              {itemsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={itemsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {items.map((item, index) => (
                  <SubListItem key={index}>
                    <ListItemText primary={item.name} />
                  </SubListItem>
                ))}
                <AddButton onClick={addNewItem}>Add Item</AddButton>
              </List>
            </Collapse>

            {/* Enemies Dropdown */}
            <ListItem button onClick={() => toggleDropdown('enemies')}>
              <ListItemText primary="Enemies" />
              {enemiesOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={enemiesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {enemies.map((enemy, index) => (
                  <SubListItem key={index}>
                    <ListItemText primary={enemy.name} />
                  </SubListItem>
                ))}
                <AddButton onClick={addNewEnemy}>Add Enemy</AddButton>
              </List>
            </Collapse>
          </List>
        </ListContainer>
      )}
    </AddOnsContainer>
  );
};

export default AddOns;

// Styled Components
const AddOnsContainer = styled.div`
  position: relative;
`;

const ListContainer = styled.div`
  background-color: #fff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  width: 200px;
`;

const SubListItem = styled(ListItem)`
  padding-left: 32px;
`;

const AddButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
  padding-left: 32px;
  color: #1976d2;
`;