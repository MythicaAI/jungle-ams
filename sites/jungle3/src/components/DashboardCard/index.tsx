import { Card, Stack, Typography } from "@mui/joy";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  textContent: string | number;
  url: string;
  title: string;
};

export const DashboardCard: React.FC<Props> = ({ textContent, url, title }) => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(url);
  };

  return (
    <Card sx={{ cursor: "pointer" }} onClick={handleNavigate}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="h4">{title}</Typography>
        <ChevronRight />
      </Stack>
      <Typography textAlign="start" level="h2">
        {textContent}
      </Typography>
    </Card>
  );
};
