import React from 'react';
import { Link, Stack } from '@mui/joy';
import { Tabs } from '../../enums';

type Props = {
  tab: string;
  setTab: (value: string) => void;
};

export const NavLinks: React.FC<Props> = (links:Props) => {
  return (
    <Stack direction="row" gap="30px">
      {Tabs.map((tabObj) => (
        <Link
          // @ts-expect-error - color is a prop here
          color={'text.primary'}
          key={tabObj.value}
          onClick={() => links.setTab(tabObj.value)}
          sx={{
            color: tabObj.value === links.tab ? '#007E63' : 'auto',
            textDecorationColor: tabObj.value === links.tab ? '#007E63' : 'auto',
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          {tabObj.label}
        </Link>
      ))}
    </Stack>
  );
};
