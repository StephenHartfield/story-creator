import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

interface BreadcrumbsProps {
  chapterTitle?: string; // Pass chapter title as a prop
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ chapterTitle }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map paths to breadcrumb names
  const breadcrumbNameMap: { [key: string]: string } = {
    parts: 'Parts',
    chapters: 'Chapters',
    pages: 'Pages',
    replies: 'Replies',
    transitions: 'Transitions',
    loops: 'Loops',
    assets: 'Assets',
    images: 'Images',
    sounds: 'Sounds',
    addons: 'AddOns',
    currencies: 'Currencies',
    items: 'Items',
    enemies: 'Enemies',
    settings: 'Settings',
  };

  return (
    <BreadcrumbWrapper>
      <BreadcrumbLink to="/">Home</BreadcrumbLink>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        // Special case: Display chapter title if on a chapter page
        if (value === 'chapters' && isLast && chapterTitle) {
          return <BreadcrumbItem key={to}>{chapterTitle}</BreadcrumbItem>;
        }

        return isLast ? (
          <BreadcrumbItem key={to}>
            {breadcrumbNameMap[value] || value}
          </BreadcrumbItem>
        ) : (
          <BreadcrumbLink key={to} to={to}>
            {breadcrumbNameMap[value] || value}
          </BreadcrumbLink>
        );
      })}
    </BreadcrumbWrapper>
  );
};

export default Breadcrumbs;

const BreadcrumbWrapper = styled.nav`
  padding: 10px 0;
  display: flex;
  gap: 5px;
  margin-left: 220px;
`;

const BreadcrumbLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbItem = styled.span`
  color: gray;
`;
