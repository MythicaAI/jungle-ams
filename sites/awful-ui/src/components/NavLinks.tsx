import { Link, Stack } from '@mui/joy';
import { Tabs } from '../enums';

type Props = {
  tab: string;
  setTab: (value: string) => void;
};

export const NavLinks: React.FC<Props> = ({ tab, setTab }) => {
  return (
    <Stack direction="row" gap="30px">
      {Tabs.map((tabObj) => (
        <Link
          //@ts-ignore
          color={'text.primary'}
          key={tabObj.value}
          onClick={() => setTab(tabObj.value)}
          sx={{
            color: tabObj.value === tab ? '#007E63' : 'auto',
            textDecorationColor: tabObj.value === tab ? '#007E63' : 'auto',
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
