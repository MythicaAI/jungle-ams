import { Box, Stack } from '@mui/joy';
import Logo from '../assets/img/mythica-logo.png';
import { NavLinks } from './NavLinks';

type Props = {
  tab: string;
  setTab: (value: string) => void;
};

export const Header: React.FC<Props> = ({ tab, setTab }) => {
  return (
    <Stack
      direction="row"
      p="30px 20px"
      justifyContent="space-between"
      sx={{
        background: '#24292E',
        boxShadow: 'rgba(0, 0, 0, 0.3) 1px 0px 16px;',
        zIndex: 1,
      }}
    >
      <Box component="img" height="32px" src={Logo} />
      <NavLinks tab={tab} setTab={setTab} />
    </Stack>
  );
};
